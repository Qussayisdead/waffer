import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const customersRouter = Router();

customersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2, req.t("validation.required")),
      name_en: z.string().min(2).optional().nullable(),
      phone: z.string().min(7, req.t("validation.phone")).optional().nullable(),
      email: z.string().email(req.t("validation.email")).optional().nullable(),
      default_discount_percent: z.number().min(0, req.t("validation.percentRange")).max(100, req.t("validation.percentRange")),
      preferred_lang: z.enum(["ar", "en"]).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const customer = await prisma.customer.create({ data: payload });
    ok(res, req.t("customer.created"), customer);
  })
);

customersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.customer.findMany({ orderBy: { created_at: "desc" } });
    ok(res, req.t("customer.listed"), items);
  })
);

customersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) throw httpError(404, "customer.notFound");
    ok(res, req.t("customer.fetched"), customer);
  })
);

customersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name_ar: z.string().min(2, req.t("validation.required")).optional(),
      name_en: z.string().min(2).optional().nullable(),
      phone: z.string().min(7, req.t("validation.phone")).optional().nullable(),
      email: z.string().email(req.t("validation.email")).optional().nullable(),
      default_discount_percent: z.number().min(0, req.t("validation.percentRange")).max(100, req.t("validation.percentRange")).optional(),
      preferred_lang: z.enum(["ar", "en"]).optional()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data: payload });
    ok(res, req.t("customer.updated"), customer);
  })
);

customersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.customer.delete({ where: { id: req.params.id } });
    ok(res, req.t("customer.deleted"));
  })
);

export { customersRouter };
