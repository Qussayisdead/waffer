import { test, expect } from "@playwright/test";

test("choose role page shows all role cards", async ({ page }) => {
  await page.goto("/choose-role");
  await expect(page.locator('a[href="/admin/login"]')).toBeVisible();
  await expect(page.locator('a[href="/login"]')).toBeVisible();
  await expect(page.locator('a[href="/customer/login"]')).toBeVisible();
});
