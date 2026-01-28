import request from "supertest";
import { app } from "../src/app.js";
import { resetDatabase, seedBaseData, disconnectDb } from "./helpers/db.js";

describe("health check", () => {
  before(async () => {
    await resetDatabase();
    await seedBaseData();
  });

  after(async () => {
    await disconnectDb();
  });

  it("responds with success", async () => {
    await request(app)
      .get("/api/v1/health")
      .expect(200)
      .expect((res) => {
        if (!res.body || res.body.success !== true) {
          throw new Error("expected success true");
        }
      });
  });
});
