import { strict as assert } from "node:assert";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";
import { loginAdmin } from "../helpers/auth.js";

describe("admin rewards API", () => {
  let seed;

  before(async () => {
    await resetDatabase();
    seed = await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("creates a reward item", async () => {
    const { agent, csrf } = await loginAdmin(app, seed.passwords.admin);
    const res = await agent
      .post("/api/v1/rewards")
      .set("X-CSRF-Token", csrf || "")
      .send({
        name_ar: "قسيمة اختبار",
        name_en: "Test Reward",
        points_cost: 50,
        value_amount: 5,
        currency: "ILS",
        type: "voucher",
        store_id: seed.store.id
      })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name_ar, "قسيمة اختبار");
  });
});
