export function computeDiscount(amount: number, percent: number) {
  const discountAmount = (amount * percent) / 100;
  const finalAmount = amount - discountAmount;
  return {
    discountAmount,
    finalAmount
  };
}
