import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";

const vouchersRouter = Router();

vouchersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const storeId = typeof req.query.store_id === "string" ? req.query.store_id : null;

    const vouchers = await prisma.customerVoucher.findMany({
      where: storeId
        ? {
            reward: {
              store_id: storeId
            }
          }
        : undefined,
      include: {
        customer: { select: { name_ar: true, name_en: true, phone: true, email: true } },
        reward: { select: { name_ar: true, name_en: true, store_id: true } }
      },
      orderBy: { created_at: "desc" },
      take: 200
    });

    const items = vouchers.map((voucher) => ({
      id: voucher.id,
      code: voucher.code,
      value_amount: Number(voucher.value_amount),
      currency: voucher.currency,
      expires_at: voucher.expires_at,
      used_at: voucher.used_at,
      reward_name: voucher.reward.name_ar || voucher.reward.name_en,
      store_id: voucher.reward.store_id,
      customer_name: voucher.customer.name_ar || voucher.customer.name_en,
      customer_phone: voucher.customer.phone,
      customer_email: voucher.customer.email
    }));

    ok(res, req.t("reward.listed"), items);
  })
);

export { vouchersRouter };
