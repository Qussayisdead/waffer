export function ok(res, message, data = null) {
  res.json({
    success: true,
    message,
    data,
    errors: []
  });
}
