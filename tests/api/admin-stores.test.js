import { strict as assert } from "node:assert";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";
import { loginAdmin } from "../helpers/auth.js";

describe("admin stores API", () => {
  let seed;

  before(async () => {
    await resetDatabase();
    seed = await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("creates and lists stores", async () => {
    const { agent, csrf } = await loginAdmin(app, seed.passwords.admin);
    const createRes = await agent
      .post("/api/v1/stores")
      .set("X-CSRF-Token", csrf || "")
      .send({
        name_ar: "متجر جديد",
        name_en: "New Store",
        max_discount_percent: 15
      })
      .expect(200);

    assert.equal(createRes.body.success, true);

    const listRes = await agent.get("/api/v1/stores").expect(200);
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.data.length >= 1);
  });
});
