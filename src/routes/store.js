import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import jsQR from "jsqr";
import rateLimit from "express-rate-limit";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const storeRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const DEFAULT_QR_OTP_TTL_MS = 5 * 60 * 1000;
const QR_OTP_TTL_MS = Number(process.env.QR_OTP_TTL_MS || DEFAULT_QR_OTP_TTL_MS);
const OTP_TTL_MS = Number.isFinite(QR_OTP_TTL_MS) ? QR_OTP_TTL_MS : DEFAULT_QR_OTP_TTL_MS;
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});
const DEFAULT_CARD_TTL_MS = 3 * 60 * 1000;
const CARD_TTL_MS = Number(process.env.CARD_TTL_MS || DEFAULT_CARD_TTL_MS);
const CARD_EXPIRY_MS = Number.isFinite(CARD_TTL_MS) ? CARD_TTL_MS : DEFAULT_CARD_TTL_MS;

function generateToken(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

function parseDateRange(input) {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 30);

  const from = input.from ? new Date(input.from) : defaultFrom;
  const to = input.to ? new Date(input.to) : now;

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw httpError(400, "errors.validation", [
      { field: "date", message: "invalid" }
    ]);
  }

  return { from, to };
}

async function assertCardActive(card, now) {
  const effectiveExpiry = card.expires_at || new Date(card.issued_at.getTime() + CARD_EXPIRY_MS);
  if (effectiveExpiry <= now) {
    if (card.status !== "expired") {
      await prisma.card.update({
        where: { id: card.id },
        data: { status: "expired", expires_at: effectiveExpiry }
      });
    }
    throw httpError(400, "card.expired");
  }
  if (card.status !== "active") throw httpError(400, "card.inactive");
}

storeRouter.post(
  "/cards/lookup",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      qr_token: z.string().min(10)
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const tokenRecord = await prisma.cardQrToken.findUnique({
      where: { token: payload.qr_token },
      include: {
        card: {
          include: { customer: true, store: true }
        }
      }
    });
    if (!tokenRecord) throw httpError(400, "qr.invalid");
    if (tokenRecord.used_at || tokenRecord.expires_at <= new Date()) {
      throw httpError(400, "qr.invalid");
    }

    const card = tokenRecord.card;
    await assertCardActive(card, new Date());

    if (req.user?.store_id && req.user.store_id !== card.store_id) {
      throw httpError(403, "auth.forbidden");
    }

    ok(res, req.t("card.fetched"), {
      customer_name: card.customer.name_ar || card.customer.name_en,
      customer_discount_percent: Number(card.store.max_discount_percent),
      store_name: card.store.name_ar || card.store.name_en
    });
  })
);

storeRouter.get(
  "/invoices/recent",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(50).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const storeId = req.user?.store_id;
    if (!storeId) throw httpError(403, "auth.forbidden");

    const take = payload.limit ?? 20;
    const invoices = await prisma.invoice.findMany({
      where: { store_id: storeId },
      orderBy: { created_at: "desc" },
      take,
      include: {
        customer: true,
        card: true
      }
    });

    ok(res, req.t("reports.fetched"), {
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        customerName: invoice.customer.name_ar || invoice.customer.name_en,
        cardNumber: invoice.card?.card_number || null,
        subtotal: Number(invoice.subtotal),
        discountAmount: Number(invoice.discount_amount),
        total: Number(invoice.total),
        currency: invoice.currency,
        createdAt: invoice.created_at
      }))
    });
  })
);

storeRouter.get(
  "/scans/recent",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      limit: z.coerce.number().int().min(1).max(50).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const storeId = req.user?.store_id;
    if (!storeId) throw httpError(403, "auth.forbidden");

    const take = payload.limit ?? 20;
    const tokens = await prisma.cardQrToken.findMany({
      where: {
        used_at: { not: null },
        card: { store_id: storeId }
      },
      orderBy: { used_at: "desc" },
      take,
      include: {
        card: {
          include: { customer: true }
        }
      }
    });

    ok(res, req.t("reports.fetched"), {
      scans: tokens.map((token) => ({
        id: token.id,
        cardNumber: token.card.card_number,
        customerName: token.card.customer.name_ar || token.card.customer.name_en,
        usedAt: token.used_at,
        source: token.source
      }))
    });
  })
);

storeRouter.get(
  "/cards/search",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      q: z.string().min(1).max(100),
      limit: z.coerce.number().int().min(1).max(50).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const storeId = req.user?.store_id;
    if (!storeId) throw httpError(403, "auth.forbidden");

    const query = payload.q.trim();
    const take = payload.limit ?? 10;
    const cards = await prisma.card.findMany({
      where: {
        store_id: storeId,
        OR: [
          { card_number: { contains: query, mode: "insensitive" } },
          { customer: { name_ar: { contains: query, mode: "insensitive" } } },
          { customer: { name_en: { contains: query, mode: "insensitive" } } },
          { customer: { phone: { contains: query, mode: "insensitive" } } },
          { customer: { email: { contains: query, mode: "insensitive" } } }
        ]
      },
      include: { customer: true },
      take
    });

    const now = new Date();
    const items = await Promise.all(
      cards.map(async (card) => {
        let status = card.status;
        const effectiveExpiry = card.expires_at || new Date(card.issued_at.getTime() + CARD_EXPIRY_MS);
        if (effectiveExpiry <= now) {
          status = "expired";
          if (card.status !== "expired") {
            await prisma.card.update({
              where: { id: card.id },
              data: { status: "expired", expires_at: effectiveExpiry }
            });
          }
        }
        return {
          id: card.id,
          cardNumber: card.card_number,
          status,
          customerName: card.customer.name_ar || card.customer.name_en,
          phone: card.customer.phone,
          email: card.customer.email
        };
      })
    );

    ok(res, req.t("card.fetched"), {
      results: items
    });
  })
);

storeRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const storeId = req.user?.store_id;
    if (!storeId) throw httpError(403, "auth.forbidden");

    const { from, to } = parseDateRange(payload);

    const rows = await prisma.$queryRaw`
      SELECT
        COALESCE(SUM(subtotal), 0) AS subtotal_sum,
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COALESCE(SUM(commission_amount), 0) AS commissions_total,
        COUNT(*) AS invoice_count
      FROM "Invoice"
      WHERE store_id = ${storeId}
        AND created_at >= ${from} AND created_at < ${to}
    `;

    const summary = rows[0] || {
      subtotal_sum: 0,
      total_sales: 0,
      discounts_given: 0,
      commissions_total: 0,
      invoice_count: 0
    };

    ok(res, req.t("reports.fetched"), {
      summary: {
        subtotal: Number(summary.subtotal_sum),
        totalSales: Number(summary.total_sales),
        discountsGiven: Number(summary.discounts_given),
        commissionsTotal: Number(summary.commissions_total),
        invoiceCount: Number(summary.invoice_count)
      }
    });
  })
);

storeRouter.get(
  "/daily",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.query);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const storeId = req.user?.store_id;
    if (!storeId) throw httpError(403, "auth.forbidden");

    const { from, to } = parseDateRange(payload);

    const rows = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', created_at) AS bucket,
        COALESCE(SUM(subtotal), 0) AS subtotal_sum,
        COALESCE(SUM(total), 0) AS total_sales,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COALESCE(SUM(commission_amount), 0) AS commissions_total,
        COUNT(*) AS invoice_count
      FROM "Invoice"
      WHERE store_id = ${storeId}
        AND created_at >= ${from} AND created_at < ${to}
      GROUP BY bucket
      ORDER BY bucket
    `;

    ok(res, req.t("reports.fetched"), {
      daily: rows.map((row) => ({
        bucket: row.bucket,
        subtotal: Number(row.subtotal_sum),
        totalSales: Number(row.total_sales),
        discountsGiven: Number(row.discounts_given),
        commissionsTotal: Number(row.commissions_total),
        invoiceCount: Number(row.invoice_count)
      }))
    });
  })
);

storeRouter.post(
  "/cards/otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      phone: z
        .string()
        .min(7)
        .regex(/^[0-9+]+$/, "validation.phone")
        .optional(),
      email: z.string().email().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    if (!payload.phone && !payload.email) {
      throw httpError(400, "errors.validation", [{ field: "phone", message: req.t("validation.required") }]);
    }

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          ...(payload.phone ? [{ phone: payload.phone }] : []),
          ...(payload.email ? [{ email: payload.email }] : [])
        ]
      }
    });
    if (!customer) throw httpError(404, "customer.notFound");

    const storeId = req.user?.store_id || undefined;
    const card = await prisma.card.findFirst({
      where: {
        customer_id: customer.id,
        status: "active",
        ...(storeId ? { store_id: storeId } : {})
      }
    });
    if (!card) throw httpError(404, "card.notFound");
    await assertCardActive(card, new Date());

    if (req.user?.store_id && req.user.store_id !== card.store_id) {
      throw httpError(403, "auth.forbidden");
    }

    const now = new Date();
    await prisma.cardQrToken.updateMany({
      where: {
        card_id: card.id,
        used_at: null,
        expires_at: { gt: now }
      },
      data: { used_at: now }
    });

    const token = generateToken("OTP");
    const expiresAt = new Date(now.getTime() + OTP_TTL_MS);
    const qrToken = await prisma.cardQrToken.create({
      data: {
        card_id: card.id,
        token,
        source: "store",
        expires_at: expiresAt
      }
    });

    ok(res, req.t("card.fetched"), {
      card_id: card.id,
      card_number: card.card_number,
      qr_token: qrToken.token,
      expires_at: qrToken.expires_at
    });
  })
);

storeRouter.post(
  "/qr/decode",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw httpError(400, "errors.validation", [{ field: "image", message: "required" }]);
    }

    const image = sharp(req.file.buffer);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const qr = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    if (!qr?.data) throw httpError(400, "qr.invalid");

    ok(res, req.t("card.fetched"), { qr_token: qr.data });
  })
);

export { storeRouter };
