import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import path from "node:path";
import { localization } from "./middleware/localization.js";
import { errorHandler } from "./middleware/error-handler.js";
import { storesRouter } from "./routes/stores.js";
import { customersRouter } from "./routes/customers.js";
import { cardsRouter } from "./routes/cards.js";
import { invoicesRouter } from "./routes/invoices.js";
import { reportsRouter } from "./routes/reports.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import { storeRouter } from "./routes/store.js";
import { customerRouter } from "./routes/customer.js";
import { adsRouter, publicAdsRouter } from "./routes/ads.js";
import { qrTokensRouter } from "./routes/qr-tokens.js";
import { rewardsRouter } from "./routes/rewards.js";
import { vouchersRouter } from "./routes/vouchers.js";
import { auditLogsRouter } from "./routes/audit-logs.js";
import { cardApplicationsRouter, publicCardApplicationsRouter } from "./routes/card-applications.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use("/uploads", express.static(path.resolve("uploads")));
app.use(localization);
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (!allowedOrigins.length) {
    if (requestOrigin) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Vary", "Origin");
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  } else if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  } else if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).send("Forbidden");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-CSRF-Token");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use((req, res, next) => {
  const method = req.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return next();
  }
  if (req.path.startsWith("/api/v1/auth/")) {
    return next();
  }
  if (req.path.startsWith("/api/v1/public/")) {
    return next();
  }
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return next();
  }
  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.get("X-CSRF-Token");
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ success: false, message: "auth.forbidden" });
  }
  next();
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/public/ads", publicAdsRouter);
app.use("/api/v1/public/card-applications", publicCardApplicationsRouter);

app.use("/api/v1/stores", requireAuth, requireRole(["admin"]), storesRouter);
app.use("/api/v1/customers", requireAuth, requireRole(["admin"]), customersRouter);
app.use("/api/v1/cards", requireAuth, requireRole(["admin"]), cardsRouter);
app.use("/api/v1/card-applications", requireAuth, requireRole(["admin"]), cardApplicationsRouter);
app.use("/api/v1/reports", requireAuth, requireRole(["admin"]), reportsRouter);
app.use("/api/v1/users", requireAuth, requireRole(["admin"]), usersRouter);
app.use("/api/v1/ads", requireAuth, requireRole(["admin"]), adsRouter);
app.use("/api/v1/rewards", requireAuth, requireRole(["admin"]), rewardsRouter);
app.use("/api/v1/vouchers", requireAuth, requireRole(["admin"]), vouchersRouter);
app.use("/api/v1/audit-logs", requireAuth, requireRole(["admin"]), auditLogsRouter);
app.use("/api/v1/qr-tokens", requireAuth, requireRole(["admin"]), qrTokensRouter);

app.use("/api/v1/invoices", requireAuth, requireRole(["admin", "store"]), invoicesRouter);
app.use("/api/v1/store", requireAuth, requireRole(["admin", "store"]), storeRouter);
app.use("/api/v1/customer", requireAuth, requireRole(["customer"]), customerRouter);

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true });
});

app.use(errorHandler);

export { app };
