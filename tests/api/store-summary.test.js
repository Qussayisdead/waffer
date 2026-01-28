import { strict as assert } from "node:assert";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";
import { loginStore } from "../helpers/auth.js";

describe("store summary API", () => {
  let seed;

  before(async () => {
    await resetDatabase();
    seed = await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("returns store summary", async () => {
    const { agent } = await loginStore(app, seed.passwords.store);
    const res = await agent.get("/api/v1/store/summary").expect(200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.summary);
  });
});
