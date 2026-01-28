import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import path from "node:path";
import { createRequire } from "node:module";
import rateLimit from "express-rate-limit";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const customerRouter = Router();
const require = createRequire(import.meta.url);
let QRCode = null;
const DEFAULT_CARD_TTL_MS = 3 * 60 * 1000;
const CARD_TTL_MS = Number(process.env.CARD_TTL_MS || DEFAULT_CARD_TTL_MS);
const CARD_EXPIRY_MS = Number.isFinite(CARD_TTL_MS) ? CARD_TTL_MS : DEFAULT_CARD_TTL_MS;

try {
  QRCode = require(path.resolve(process.cwd(), "admin/node_modules/qrcode"));
} catch {
  QRCode = null;
}

function generateToken(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

const DEFAULT_QR_OTP_TTL_MS = 2 * 60 * 1000;
const QR_OTP_TTL_MS = Number(process.env.QR_OTP_TTL_MS || DEFAULT_QR_OTP_TTL_MS);
const OTP_TTL_MS = Number.isFinite(QR_OTP_TTL_MS) ? QR_OTP_TTL_MS : DEFAULT_QR_OTP_TTL_MS;
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

customerRouter.get(
  "/stores",
  asyncHandler(async (req, res) => {
    const items = await prisma.store.findMany({
      where: { is_active: true },
      orderBy: { name_ar: "asc" }
    });
    ok(res, req.t("store.listed"), items);
  })
);

customerRouter.get(
  "/points",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { points_balance: true }
    });
    if (!customer) throw httpError(401, "auth.unauthorized");

    ok(res, req.t("customer.fetched"), customer);
  })
);

customerRouter.get(
  "/points/history",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const items = await prisma.pointsTransaction.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: "desc" },
      take: 50
    });
    ok(res, req.t("customer.fetched"), items);
  })
);

customerRouter.post(
  "/points/redeem",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const schema = z.object({
      points: z.number().int().positive()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { points_balance: true }
      });
      if (!customer) throw httpError(401, "auth.unauthorized");
      if (customer.points_balance < payload.points) {
        throw httpError(400, "errors.validation", [{ field: "points", message: "validation.amount" }]);
      }

      await tx.customer.update({
        where: { id: customerId },
        data: { points_balance: { decrement: payload.points } }
      });

      await tx.pointsTransaction.create({
        data: {
          customer_id: customerId,
          type: "redeem",
          points: payload.points
        }
      });

      return { points_balance: customer.points_balance - payload.points };
    });

    ok(res, req.t("customer.updated"), result);
  })
);

customerRouter.get(
  "/rewards",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const now = new Date();
    const cards = await prisma.card.findMany({
      where: {
        customer_id: customerId,
        status: "active",
        OR: [{ expires_at: null }, { expires_at: { gt: now } }]
      },
      select: { store_id: true }
    });
    const storeIds = [...new Set(cards.map((card) => card.store_id))];

    const rewards = await prisma.rewardItem.findMany({
      where: {
        is_active: true,
        OR: [
          { store_id: null },
          ...(storeIds.length > 0 ? [{ store_id: { in: storeIds } }] : [])
        ]
      },
      include: { store: { select: { name_ar: true, name_en: true } } },
      orderBy: { created_at: "desc" }
    });

    const items = rewards.map((reward) => ({
      id: reward.id,
      name: reward.name_ar || reward.name_en,
      points_cost: reward.points_cost,
      value_amount: Number(reward.value_amount),
      currency: reward.currency,
      store_name: reward.store?.name_ar || reward.store?.name_en || null,
      type: reward.type
    }));

    ok(res, req.t("customer.fetched"), items);
  })
);

customerRouter.get(
  "/vouchers",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const vouchers = await prisma.customerVoucher.findMany({
      where: { customer_id: customerId },
      include: { reward: { select: { name_ar: true, name_en: true } } },
      orderBy: { created_at: "desc" },
      take: 50
    });

    const items = vouchers.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      reward_name: voucher.reward.name_ar || voucher.reward.name_en,
      value_amount: Number(voucher.value_amount),
      currency: voucher.currency,
      expires_at: voucher.expires_at,
      used_at: voucher.used_at
    }));

    ok(res, req.t("customer.fetched"), items);
  })
);

customerRouter.post(
  "/rewards/redeem",
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const schema = z.object({
      reward_id: z.string().uuid(req.t("validation.uuid"))
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const now = new Date();
    const cards = await prisma.card.findMany({
      where: {
        customer_id: customerId,
        status: "active",
        OR: [{ expires_at: null }, { expires_at: { gt: now } }]
      },
      select: { store_id: true }
    });
    const storeIds = [...new Set(cards.map((card) => card.store_id))];

    const reward = await prisma.rewardItem.findFirst({
      where: {
        id: payload.reward_id,
        is_active: true,
        OR: [
          { store_id: null },
          ...(storeIds.length > 0 ? [{ store_id: { in: storeIds } }] : [])
        ]
      }
    });
    if (!reward) throw httpError(404, "errors.validation", [{ field: "reward_id", message: "validation.required" }]);

    const expiryMs = reward.expiry_days * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + expiryMs);

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { points_balance: true }
      });
      if (!customer) throw httpError(401, "auth.unauthorized");
      if (customer.points_balance < reward.points_cost) {
        throw httpError(400, "errors.validation", [{ field: "points", message: "validation.amount" }]);
      }

      await tx.customer.update({
        where: { id: customerId },
        data: { points_balance: { decrement: reward.points_cost } }
      });

      const voucher = await tx.customerVoucher.create({
        data: {
          customer_id: customerId,
          reward_id: reward.id,
          code: `VCH_${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
          value_amount: reward.value_amount,
          currency: reward.currency,
          expires_at: expiresAt
        }
      });

      await tx.pointsTransaction.create({
        data: {
          customer_id: customerId,
          type: "redeem",
          points: reward.points_cost
        }
      });

      return {
        points_balance: customer.points_balance - reward.points_cost,
        voucher
      };
    });

    ok(res, req.t("customer.updated"), result);
  })
);

customerRouter.post(
  "/cards",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      store_id: z.string().uuid(req.t("validation.uuid"))
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const now = new Date();
    const existing = await prisma.card.findFirst({
      where: {
        customer_id: customerId,
        store_id: payload.store_id,
        status: "active",
        OR: [
          { expires_at: { gt: now } },
          { expires_at: null, issued_at: { gt: new Date(now.getTime() - CARD_EXPIRY_MS) } }
        ]
      }
    });

    await prisma.card.updateMany({
      where: {
        customer_id: customerId,
        store_id: payload.store_id,
        status: "active",
        OR: [
          { expires_at: { lte: now } },
          { expires_at: null, issued_at: { lte: new Date(now.getTime() - CARD_EXPIRY_MS) } }
        ]
      },
      data: { status: "expired", expires_at: now }
    });

    const card =
      existing ||
      (await prisma.card.create({
        data: {
          customer_id: customerId,
          store_id: payload.store_id,
          card_number: generateToken("CARD"),
          qr_token: generateToken("QR"),
          status: "active",
          expires_at: new Date(now.getTime() + CARD_EXPIRY_MS)
        }
      }));

    let qrSvg = null;
    if (QRCode) {
      qrSvg = await QRCode.toString(card.qr_token, { type: "svg", margin: 1 });
    }

    ok(res, req.t("card.issued"), {
      id: card.id,
      card_number: card.card_number,
      qr_token: card.qr_token,
      qr_svg: qrSvg
    });
  })
);

customerRouter.post(
  "/cards/:id/otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const customerId = req.user?.sub;
    if (!customerId) throw httpError(401, "auth.unauthorized");

    const card = await prisma.card.findFirst({
      where: {
        id: req.params.id,
        customer_id: customerId,
        status: "active"
      }
    });
    if (!card) throw httpError(404, "card.notFound");

    const now = new Date();
    const effectiveExpiry = card.expires_at || new Date(card.issued_at.getTime() + CARD_EXPIRY_MS);
    if (effectiveExpiry <= now) {
      await prisma.card.update({
        where: { id: card.id },
        data: { status: "expired", expires_at: effectiveExpiry }
      });
      throw httpError(400, "card.expired");
    }
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
        source: "customer",
        expires_at: expiresAt
      }
    });

    let qrSvg = null;
    if (QRCode) {
      qrSvg = await QRCode.toString(qrToken.token, { type: "svg", margin: 1 });
    }

    ok(res, req.t("card.fetched"), {
      card_id: card.id,
      qr_token: qrToken.token,
      expires_at: qrToken.expires_at,
      qr_svg: qrSvg
    });
  })
);

export { customerRouter };
