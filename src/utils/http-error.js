export function httpError(status, messageKey, errors = []) {
  const err = new Error(messageKey);
  err.status = status;
  err.messageKey = messageKey;
  err.errors = errors;
  return err;
}
