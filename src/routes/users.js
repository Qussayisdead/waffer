import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";

const usersRouter = Router();

usersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        store_id: true,
        created_at: true
      }
    });
    ok(res, req.t("users.fetched"), users);
  })
);

usersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["admin", "store"]),
      store_id: z.string().uuid().optional().nullable()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    if (payload.role === "store" && !payload.store_id) {
      throw httpError(400, "errors.validation", [
        { field: "store_id", message: "required" }
      ]);
    }

    const hashed = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password_hash: hashed,
        role: payload.role,
        store_id: payload.store_id || null
      }
    });

    ok(res, req.t("auth.created"), {
      id: user.id,
      email: user.email,
      role: user.role
    });
  })
);

export { usersRouter };
