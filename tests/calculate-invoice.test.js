import assert from "node:assert/strict";
import { calculateInvoice } from "../src/services/calculate-invoice.js";
import { messagesAr } from "../src/i18n/messages.ar.js";

describe("calculateInvoice", () => {
  it("returns applied discount, discount value, and final amount", () => {
    const result = calculateInvoice(1000, 15, 10);
    assert.equal(result.appliedDiscountPercent, 10);
    assert.equal(result.discountValue, 100);
    assert.equal(result.finalAmount, 900);
  });

  it("accepts numeric strings", () => {
    const result = calculateInvoice("200", "5", "8");
    assert.equal(result.appliedDiscountPercent, 5);
    assert.equal(result.discountValue, 10);
    assert.equal(result.finalAmount, 190);
  });

  it("throws Arabic error message for invalid amount", () => {
    try {
      calculateInvoice(-5, 10, 10);
      assert.fail("Expected error");
    } catch (err) {
      assert.equal(err.message, messagesAr.errors.invalidAmount);
      assert.equal(err.code, "INVALID_AMOUNT");
    }
  });

  it("throws Arabic error message for invalid customer discount", () => {
    try {
      calculateInvoice(100, 150, 10);
      assert.fail("Expected error");
    } catch (err) {
      assert.equal(err.message, messagesAr.errors.invalidCustomerDiscount);
      assert.equal(err.code, "INVALID_CUSTOMER_DISCOUNT");
    }
  });

  it("throws Arabic error message for invalid store discount", () => {
    try {
      calculateInvoice(100, 10, -1);
      assert.fail("Expected error");
    } catch (err) {
      assert.equal(err.message, messagesAr.errors.invalidStoreDiscount);
      assert.equal(err.code, "INVALID_STORE_DISCOUNT");
    }
  });
});
