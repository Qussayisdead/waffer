export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status || 500;
  let messageKey = err.messageKey || "errors.internal";

  if (err.code && (err.code.startsWith("LIMIT_") || err.name === "MulterError")) {
    status = 400;
    messageKey = "errors.validation";
  }
  const message = req.t ? req.t(messageKey) : "Internal error";
  const errors = err.errors || [];

  res.status(status).json({
    success: false,
    message,
    data: null,
    errors
  });
}
