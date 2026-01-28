import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const cardApplicationsRouter = Router();
const publicCardApplicationsRouter = Router();
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

publicCardApplicationsRouter.post(
  "/",
  publicLimiter,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2, req.t("validation.required")),
      phone: z.string().min(7, req.t("validation.phone")).optional().nullable(),
      email: z.string().email(req.t("validation.email")).optional().nullable(),
      city: z.string().min(2, req.t("validation.required")).optional().nullable(),
      card_type: z.string().min(2).optional().nullable()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    if (!payload.phone && !payload.email) {
      throw httpError(400, "errors.validation", [
        { field: "phone", message: "validation.required" }
      ]);
    }

    const application = await prisma.cardApplication.create({
      data: {
        name: payload.name,
        phone: payload.phone || null,
        email: payload.email || null,
        city: payload.city || null,
        card_type: payload.card_type || "golden",
        status: "pending"
      }
    });

    ok(res, req.t("cardApplication.created"), application);
  })
);

cardApplicationsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await prisma.cardApplication.findMany({ orderBy: { created_at: "desc" } });
    ok(res, req.t("cardApplication.listed"), items);
  })
);

cardApplicationsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      status: z.enum(["pending", "completed", "rejected"])
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const application = await prisma.cardApplication.update({
      where: { id: req.params.id },
      data: { status: payload.status }
    });

    ok(res, req.t("cardApplication.updated"), application);
  })
);

export { cardApplicationsRouter, publicCardApplicationsRouter };
