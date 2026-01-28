import { test, expect } from "@playwright/test";

const email = process.env.E2E_CUSTOMER_EMAIL;
const password = process.env.E2E_CUSTOMER_PASSWORD;

test.describe("customer login", () => {
  test.skip(!email || !password, "E2E customer credentials not set");

  test("logs in and reaches customer dashboard", async ({ page }) => {
    await page.goto("/customer/login");
    await page.getByTestId("customer-login-email").fill(email || "");
    await page.getByTestId("customer-login-password").fill(password || "");
    await page.getByTestId("customer-login-submit").click();
    await expect(page).toHaveURL(/\/customer/);
  });
});
