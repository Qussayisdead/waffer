import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";

const qrTokensRouter = Router();

qrTokensRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const storeId = typeof req.query.store_id === "string" ? req.query.store_id : null;

    const tokens = await prisma.cardQrToken.findMany({
      where: {
        source: "store",
        ...(storeId ? { card: { store_id: storeId } } : {})
      },
      orderBy: { created_at: "desc" },
      include: {
        card: {
          select: {
            card_number: true,
            store: { select: { id: true, name_ar: true, name_en: true } }
          }
        }
      }
    });

    const items = tokens.map((token) => ({
      id: token.id,
      token: token.token,
      created_at: token.created_at,
      expires_at: token.expires_at,
      used_at: token.used_at,
      card_number: token.card.card_number,
      store_id: token.card.store.id,
      store_name: token.card.store.name_ar || token.card.store.name_en
    }));

    ok(res, "qr.listed", items);
  })
);

export { qrTokensRouter };
