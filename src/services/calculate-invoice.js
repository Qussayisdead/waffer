import { getMessage } from "../i18n/index.js";

function isValidPercent(value) {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

function toNumber(value) {
  return typeof value === "string" && value.trim() !== "" ? Number(value) : value;
}

export function calculateInvoice(amount, customerDiscount, storeMaxDiscount, options = {}) {
  const locale = options.locale || "ar";
  const amountNumber = toNumber(amount);
  const customerNumber = toNumber(customerDiscount);
  const storeNumber = toNumber(storeMaxDiscount);

  if (!Number.isFinite(amountNumber) || amountNumber < 0) {
    const message = getMessage(locale, "errors.invalidAmount");
    const error = new Error(message);
    error.code = "INVALID_AMOUNT";
    error.messageKey = "errors.invalidAmount";
    throw error;
  }

  if (!isValidPercent(customerNumber)) {
    const message = getMessage(locale, "errors.invalidCustomerDiscount");
    const error = new Error(message);
    error.code = "INVALID_CUSTOMER_DISCOUNT";
    error.messageKey = "errors.invalidCustomerDiscount";
    throw error;
  }

  if (!isValidPercent(storeNumber)) {
    const message = getMessage(locale, "errors.invalidStoreDiscount");
    const error = new Error(message);
    error.code = "INVALID_STORE_DISCOUNT";
    error.messageKey = "errors.invalidStoreDiscount";
    throw error;
  }

  const appliedDiscountPercent = Math.min(customerNumber, storeNumber);
  const discountValue = Number(((amountNumber * appliedDiscountPercent) / 100).toFixed(2));
  const finalAmount = Number((amountNumber - discountValue).toFixed(2));

  return {
    appliedDiscountPercent,
    discountValue,
    finalAmount
  };
}
