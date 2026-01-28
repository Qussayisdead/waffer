import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";
import { logAudit } from "../utils/audit.js";

const rewardsRouter = Router();

rewardsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const storeId = typeof req.query.store_id === "string" ? req.query.store_id : null;
    const isActive = req.query.active === "false" ? undefined : true;

    const rewards = await prisma.rewardItem.findMany({
      where: {
        ...(storeId ? { store_id: storeId } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {})
      },
      include: { store: { select: { id: true, name_ar: true, name_en: true } } },
      orderBy: { created_at: "desc" }
    });

    const items = rewards.map((reward) => ({
      id: reward.id,
      name_ar: reward.name_ar,
      name_en: reward.name_en,
      type: reward.type,
      points_cost: reward.points_cost,
      value_amount: Number(reward.value_amount),
      currency: reward.currency,
      expiry_days: reward.expiry_days,
      is_active: reward.is_active,
      store_id: reward.store_id,
      store_name: reward.store?.name_ar || reward.store?.name_en || null
    }));

    ok(res, req.t("reward.listed"), items);
  })
);

rewardsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2),
      name_en: z.string().optional().nullable(),
      type: z.string().min(2),
      points_cost: z.number().int().positive(),
      value_amount: z.number().positive(),
      currency: z.string().length(3).optional(),
      store_id: z.string().uuid().optional().nullable(),
      expiry_days: z.number().int().positive().optional(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const reward = await prisma.rewardItem.create({
      data: {
        name_ar: payload.name_ar,
        name_en: payload.name_en || null,
        type: payload.type,
        points_cost: payload.points_cost,
        value_amount: payload.value_amount,
        currency: payload.currency || "ILS",
        store_id: payload.store_id || null,
        expiry_days: payload.expiry_days || 7,
        is_active: payload.is_active ?? true
      }
    });
    await logAudit({
      req,
      action: "create",
      entity: "reward",
      entityId: reward.id,
      storeId: reward.store_id,
      meta: { points_cost: reward.points_cost, value_amount: reward.value_amount }
    });

    ok(res, req.t("reward.created"), reward);
  })
);

rewardsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2).optional(),
      name_en: z.string().optional().nullable(),
      type: z.string().min(2).optional(),
      points_cost: z.number().int().positive().optional(),
      value_amount: z.number().positive().optional(),
      currency: z.string().length(3).optional(),
      store_id: z.string().uuid().optional().nullable(),
      expiry_days: z.number().int().positive().optional(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const reward = await prisma.rewardItem.update({
      where: { id: req.params.id },
      data: payload
    });
    await logAudit({
      req,
      action: "update",
      entity: "reward",
      entityId: reward.id,
      storeId: reward.store_id,
      meta: payload
    });

    ok(res, req.t("reward.updated"), reward);
  })
);

rewardsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const reward = await prisma.rewardItem.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });
    await logAudit({
      req,
      action: "disable",
      entity: "reward",
      entityId: reward.id,
      storeId: reward.store_id
    });

    ok(res, req.t("reward.deleted"), reward);
  })
);

export { rewardsRouter };
