import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const cardsRouter = Router();
const DEFAULT_CARD_TTL_MS = 3 * 60 * 1000;
const CARD_TTL_MS = Number(process.env.CARD_TTL_MS || DEFAULT_CARD_TTL_MS);
const CARD_EXPIRY_MS = Number.isFinite(CARD_TTL_MS) ? CARD_TTL_MS : DEFAULT_CARD_TTL_MS;

function generateToken(prefix) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}

cardsRouter.post(
  "/issue",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      customer_id: z.string().uuid(req.t("validation.uuid")),
      store_id: z.string().uuid(req.t("validation.uuid"))
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const now = new Date();
    const card = await prisma.card.create({
      data: {
        customer_id: payload.customer_id,
        store_id: payload.store_id,
        card_number: generateToken("CARD"),
        qr_token: generateToken("QR"),
        status: "active",
        expires_at: new Date(now.getTime() + CARD_EXPIRY_MS)
      }
    });

    ok(res, req.t("card.issued"), card);
  })
);

cardsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const card = await prisma.card.findUnique({ where: { id: req.params.id } });
    if (!card) throw httpError(404, "card.notFound");
    ok(res, req.t("card.fetched"), card);
  })
);

cardsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const storeId = typeof req.query.store_id === "string" ? req.query.store_id : null;
    const cards = await prisma.card.findMany({
      orderBy: { issued_at: "desc" },
      where: storeId ? { store_id: storeId } : undefined,
      include: {
        customer: { select: { name_ar: true, name_en: true } },
        store: { select: { name_ar: true, name_en: true } }
      }
    });
    const items = cards.map((card) => ({
      id: card.id,
      card_number: card.card_number,
      qr_token: card.qr_token,
      status: card.status,
      issued_at: card.issued_at,
      customer_name: card.customer?.name_ar || card.customer?.name_en,
      store_name: card.store?.name_ar || card.store?.name_en
    }));
    ok(res, req.t("card.listed"), items);
  })
);

cardsRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(["active", "blocked", "expired"])
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: { status: payload.status }
    });
    ok(res, req.t("card.updated"), card);
  })
);

export { cardsRouter };
