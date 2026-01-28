import { test, expect } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin login", () => {
  test.skip(!email || !password, "E2E admin credentials not set");

  test("logs in and reaches admin dashboard", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByTestId("admin-login-email").fill(email || "");
    await page.getByTestId("admin-login-password").fill(password || "");
    await page.getByTestId("admin-login-submit").click();
    await expect(page).toHaveURL(/\/admin/);
  });
});
