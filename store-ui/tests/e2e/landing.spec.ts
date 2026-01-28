import { test, expect } from "@playwright/test";

test("landing page loads and has primary CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/choose-role"]').first()).toBeVisible();
  await expect(page.locator("header")).toBeVisible();
});

test("stores section is reachable", async ({ page }) => {
  await page.goto("/#stores");
  await expect(page.locator("#stores")).toBeVisible();
});
