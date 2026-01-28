export function computeDiscount(subtotal, customerPercent, storeMaxPercent) {
  const appliedPercent = Math.min(customerPercent, storeMaxPercent);
  const discountAmount = Number((subtotal * appliedPercent) / 100);
  const total = Number(subtotal - discountAmount);
  return {
    appliedPercent,
    discountAmount,
    total
  };
}
