import jwt from "jsonwebtoken";
import { httpError } from "../utils/http-error.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const headerToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieToken = req.cookies?.access_token || null;
  const token = headerToken || cookieToken;
  if (!token) return next(httpError(401, "auth.unauthorized"));

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return next(httpError(500, "errors.internal"));
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return next(httpError(401, "auth.unauthorized"));
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return next(httpError(401, "auth.unauthorized"));
    if (!roles.includes(req.user.role)) return next(httpError(403, "auth.forbidden"));
    next();
  };
}
