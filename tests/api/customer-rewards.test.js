import { strict as assert } from "node:assert";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";
import { loginCustomer } from "../helpers/auth.js";

describe("customer rewards API", () => {
  let seed;

  before(async () => {
    await resetDatabase();
    seed = await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("lists rewards and vouchers", async () => {
    const { agent } = await loginCustomer(app, seed.passwords.customer);

    const rewardsRes = await agent.get("/api/v1/customer/rewards").expect(200);
    assert.ok(Array.isArray(rewardsRes.body.data));

    const vouchersRes = await agent.get("/api/v1/customer/vouchers").expect(200);
    assert.ok(Array.isArray(vouchersRes.body.data));
  });
});
