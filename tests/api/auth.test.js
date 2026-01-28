import { strict as assert } from "node:assert";
import request from "supertest";
import { app } from "../../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "../helpers/db.js";

describe("auth API", () => {
  before(async () => {
    await resetDatabase();
    await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("logs in admin successfully", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.local", password: "Admin12345" })
      .expect(200);

    assert.equal(res.body.success, true);
    assert.ok(res.headers["set-cookie"]);
  });

  it("rejects wrong password", async () => {
    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@test.local", password: "WrongPass" })
      .expect(401);
  });

  it("logs in customer successfully", async () => {
    const res = await request(app)
      .post("/api/v1/auth/customer/login")
      .send({ email: "customer@test.local", password: "Customer12345" })
      .expect(200);

    assert.equal(res.body.success, true);
  });
});
