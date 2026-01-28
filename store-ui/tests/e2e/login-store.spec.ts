import { test, expect } from "@playwright/test";

const email = process.env.E2E_STORE_EMAIL;
const password = process.env.E2E_STORE_PASSWORD;

test.describe("store login", () => {
  test.skip(!email || !password, "E2E store credentials not set");

  test("logs in and reaches terminal", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("store-login-email").fill(email || "");
    await page.getByTestId("store-login-password").fill(password || "");
    await page.getByTestId("store-login-submit").click();
    await expect(page).toHaveURL(/\/terminal/);
  });
});
