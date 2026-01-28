import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";
import { computeDiscount } from "../services/discount.js";

const invoicesRouter = Router();
const DEFAULT_CARD_TTL_MS = 3 * 60 * 1000;
const CARD_TTL_MS = Number(process.env.CARD_TTL_MS || DEFAULT_CARD_TTL_MS);
const CARD_EXPIRY_MS = Number.isFinite(CARD_TTL_MS) ? CARD_TTL_MS : DEFAULT_CARD_TTL_MS;

invoicesRouter.post(
  "/scan",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      qr_token: z.string().min(10, req.t("validation.required")),
      subtotal: z.number().min(0, req.t("validation.amount")),
      currency: z.string().length(3).optional()
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

    const card = tokenRecord.card;
    const now = new Date();
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
    if (req.user?.store_id && req.user.store_id !== card.store_id) {
      throw httpError(403, "auth.forbidden");
    }

    const customerPercent = Number(card.customer.default_discount_percent);
    const storeMax = Number(card.store.max_discount_percent);
    const commissionPercent = Number(card.store.commission_percent || 0);
    const subtotal = Number(payload.subtotal);
    const { appliedPercent, discountAmount, total } = computeDiscount(subtotal, customerPercent, storeMax);
    const pointsEarned = Math.floor(Number(discountAmount) / 10);
    const commissionAmount = (Number(total) * commissionPercent) / 100;

    const invoice = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.cardQrToken.updateMany({
        where: {
          id: tokenRecord.id,
          used_at: null,
          expires_at: { gt: now }
        },
        data: { used_at: now }
      });
      if (updateResult.count === 0) {
        throw httpError(400, "qr.invalid");
      }

      if (pointsEarned > 0) {
        await tx.customer.update({
          where: { id: card.customer_id },
          data: { points_balance: { increment: pointsEarned } }
        });
      }

      const createdInvoice = await tx.invoice.create({
        data: {
          store_id: card.store_id,
          customer_id: card.customer_id,
          card_id: card.id,
          subtotal,
          discount_percent_applied: appliedPercent,
          discount_amount: discountAmount,
          total,
          currency: payload.currency || "ILS",
          points_earned: pointsEarned,
          commission_amount: commissionAmount
        }
      });
      if (pointsEarned > 0) {
        await tx.pointsTransaction.create({
          data: {
            customer_id: card.customer_id,
            invoice_id: createdInvoice.id,
            type: "earn",
            points: pointsEarned
          }
        });
      }
      return createdInvoice;
    });

    ok(res, req.t("invoice.created"), {
      invoice,
      applied_discount_percent: appliedPercent,
      customer_name: card.customer.name_ar || card.customer.name_en,
      store_name: card.store.name_ar || card.store.name_en
    });
  })
);

export { invoicesRouter };
