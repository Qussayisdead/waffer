import { strict as assert } from "node:assert";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";
import { loginCustomer } from "../helpers/auth.js";

describe("customer flow API", () => {
  let seed;

  before(async () => {
    await resetDatabase();
    seed = await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("creates a card and OTP", async () => {
    const { agent, csrf } = await loginCustomer(app, seed.passwords.customer);
    const cardRes = await agent
      .post("/api/v1/customer/cards")
      .set("X-CSRF-Token", csrf || "")
      .send({ store_id: seed.store.id })
      .expect(200);

    assert.ok(cardRes.body.data.id);

    const otpRes = await agent
      .post(`/api/v1/customer/cards/${cardRes.body.data.id}/otp`)
      .set("X-CSRF-Token", csrf || "")
      .expect(200);

    assert.ok(otpRes.body.data.qr_token);
  });
});
