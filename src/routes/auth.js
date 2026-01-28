import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { ok } from "../utils/response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { httpError } from "../utils/http-error.js";
import { zodErrorToList } from "../utils/validation.js";
import { requireAuth } from "../middleware/auth.js";

const authRouter = Router();
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/"
  };
}

function getCsrfCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: false,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/"
  };
}

function setCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie("csrf_token", token, { ...getCsrfCookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
  return token;
}

function setAuthCookies(res, payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw httpError(500, "errors.internal");
  const accessToken = jwt.sign(payload, secret, { expiresIn: ACCESS_TOKEN_TTL });
  const refreshToken = jwt.sign(
    { sub: payload.sub, role: payload.role, store_id: payload.store_id, type: "refresh" },
    secret,
    { expiresIn: REFRESH_TOKEN_TTL }
  );
  const options = getCookieOptions();
  res.cookie("access_token", accessToken, { ...options, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 });
  setCsrfCookie(res);
  return { accessToken, refreshToken };
}

function clearAuthCookies(res) {
  const options = getCookieOptions();
  res.clearCookie("access_token", options);
  res.clearCookie("refresh_token", options);
  res.clearCookie("csrf_token", getCsrfCookieOptions());
}

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(4)
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) throw httpError(401, "auth.invalid");

    const valid = await bcrypt.compare(payload.password, user.password_hash);
    if (!valid) throw httpError(401, "auth.invalid");

    const tokenPayload = { sub: user.id, role: user.role, store_id: user.store_id };
    const { accessToken } = setAuthCookies(res, tokenPayload);

    ok(res, req.t("auth.loginSuccess"), {
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        store_id: user.store_id
      }
    });
  })
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { store: true }
    });
    if (!user) throw httpError(401, "auth.unauthorized");

    ok(res, req.t("auth.loginSuccess"), {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      store_id: user.store_id,
      store_name: user.store?.name_ar || user.store?.name_en || null
    });
  })
);

authRouter.post(
  "/customer/register",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      phone: z.string().min(7).optional().nullable(),
      email: z.string().email().optional().nullable(),
      password: z.string().min(8)
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    if (!payload.email && !payload.phone) {
      throw httpError(400, "errors.validation", [
        { field: "email", message: "validation.required" }
      ]);
    }

    const existing = await prisma.customer.findFirst({
      where: {
        OR: [
          payload.email ? { email: payload.email } : undefined,
          payload.phone ? { phone: payload.phone } : undefined
        ].filter(Boolean)
      }
    });
    if (existing) throw httpError(409, "auth.conflict");

    const hashed = await bcrypt.hash(payload.password, 12);
    const customer = await prisma.customer.create({
      data: {
        name_ar: payload.name,
        phone: payload.phone || null,
        email: payload.email || null,
        password_hash: hashed,
        default_discount_percent: 0,
        preferred_lang: "ar"
      }
    });

    ok(res, req.t("auth.created"), {
      id: customer.id,
      name: customer.name_ar,
      email: customer.email,
      phone: customer.phone
    });
  })
);

authRouter.post(
  "/customer/login",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      email: z.string().email().optional().nullable(),
      phone: z.string().min(7).optional().nullable(),
      password: z.string().min(4)
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    if (!payload.email && !payload.phone) {
      throw httpError(400, "errors.validation", [
        { field: "email", message: "validation.required" }
      ]);
    }

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          payload.email ? { email: payload.email } : undefined,
          payload.phone ? { phone: payload.phone } : undefined
        ].filter(Boolean)
      }
    });
    if (!customer || !customer.password_hash) throw httpError(401, "auth.invalid");

    const valid = await bcrypt.compare(payload.password, customer.password_hash);
    if (!valid) throw httpError(401, "auth.invalid");

    const { accessToken } = setAuthCookies(res, { sub: customer.id, role: "customer" });

    ok(res, req.t("auth.loginSuccess"), {
      token: accessToken,
      customer: {
        id: customer.id,
        name: customer.name_ar,
        email: customer.email,
        phone: customer.phone
      }
    });
  })
);

authRouter.get(
  "/customer/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user?.role !== "customer") throw httpError(403, "auth.forbidden");
    const customer = await prisma.customer.findUnique({ where: { id: req.user.sub } });
    if (!customer) throw httpError(401, "auth.unauthorized");

    ok(res, req.t("auth.loginSuccess"), {
      id: customer.id,
      name: customer.name_ar,
      email: customer.email,
      phone: customer.phone,
      points_balance: customer.points_balance
    });
  })
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.refresh_token;
    if (!token) throw httpError(401, "auth.unauthorized");

    const secret = process.env.JWT_SECRET;
    if (!secret) throw httpError(500, "errors.internal");

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw httpError(401, "auth.unauthorized");
    }
    if (payload?.type !== "refresh") throw httpError(401, "auth.unauthorized");

    if (!["admin", "store", "customer"].includes(payload.role)) {
      clearAuthCookies(res);
      throw httpError(401, "auth.unauthorized");
    }

    if (payload.role === "customer") {
      const customer = await prisma.customer.findUnique({ where: { id: payload.sub } });
      if (!customer) {
        clearAuthCookies(res);
        throw httpError(401, "auth.unauthorized");
      }
    } else {
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        clearAuthCookies(res);
        throw httpError(401, "auth.unauthorized");
      }
    }

    const { accessToken } = setAuthCookies(res, {
      sub: payload.sub,
      role: payload.role,
      store_id: payload.store_id || null
    });

    ok(res, req.t("auth.loginSuccess"), { token: accessToken });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    clearAuthCookies(res);
    ok(res, req.t("auth.loginSuccess"), { success: true });
  })
);

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(["admin", "store"]).optional(),
      store_id: z.string().uuid().optional().nullable()
    });

    let payload;
    try {
      payload = schema.parse(req.body);
    } catch (err) {
      throw httpError(400, "errors.validation", zodErrorToList(err));
    }

    const existingCount = await prisma.user.count();
    if (existingCount > 0) {
      throw httpError(403, "auth.forbidden");
    }

    const hashed = await bcrypt.hash(payload.password, 12);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password_hash: hashed,
        role: payload.role || "admin",
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

export { authRouter };
