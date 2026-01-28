import { defineConfig } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

process.env.E2E_ADMIN_EMAIL ||= "admin@test.local";
process.env.E2E_ADMIN_PASSWORD ||= "Admin12345";
process.env.E2E_STORE_EMAIL ||= "store@test.local";
process.env.E2E_STORE_PASSWORD ||= "Store12345";
process.env.E2E_CUSTOMER_EMAIL ||= "customer@test.local";
process.env.E2E_CUSTOMER_PASSWORD ||= "Customer12345";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL,
    headless: false
  },
  timeout: 60000
});
