import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";
import { logAudit } from "../utils/audit.js";

const storesRouter = Router();

storesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2, req.t("validation.required")),
      name_en: z.string().min(2).optional().nullable(),
      max_discount_percent: z.number().min(0, req.t("validation.percentRange")).max(100, req.t("validation.percentRange")),
      commission_percent: z.number().min(0).max(100).optional(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const store = await prisma.store.create({ data: payload });
    await logAudit({
      req,
      action: "create",
      entity: "store",
      entityId: store.id,
      storeId: store.id
    });
    ok(res, req.t("store.created"), store);
  })
);

storesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.store.findMany({ orderBy: { created_at: "desc" } });
    ok(res, req.t("store.listed"), items);
  })
);

storesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const store = await prisma.store.findUnique({ where: { id: req.params.id } });
    if (!store) throw httpError(404, "store.notFound");
    ok(res, req.t("store.fetched"), store);
  })
);

storesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2, req.t("validation.required")).optional(),
      name_en: z.string().min(2).optional().nullable(),
      max_discount_percent: z.number().min(0, req.t("validation.percentRange")).max(100, req.t("validation.percentRange")).optional(),
      commission_percent: z.number().min(0).max(100).optional(),
      is_active: z.boolean().optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const store = await prisma.store.update({ where: { id: req.params.id }, data: payload });
    await logAudit({
      req,
      action: "update",
      entity: "store",
      entityId: store.id,
      storeId: store.id,
      meta: payload
    });
    ok(res, req.t("store.updated"), store);
  })
);

storesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const store = await prisma.store.update({
      where: { id: req.params.id },
      data: { is_active: false }
    });
    await logAudit({
      req,
      action: "disable",
      entity: "store",
      entityId: store.id,
      storeId: store.id
    });
    ok(res, req.t("store.deleted"), store);
  })
);

export { storesRouter };
