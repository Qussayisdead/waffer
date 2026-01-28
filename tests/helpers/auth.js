import request from "supertest";

function getCookieValue(res, name) {
  const cookies = res.headers["set-cookie"] || [];
  for (const cookie of cookies) {
    const [pair] = cookie.split(";");
    const [key, value] = pair.split("=");
    if (key === name) return value;
  }
  return null;
}

export async function loginAdmin(app, password) {
  const agent = request.agent(app);
  const res = await agent.post("/api/v1/auth/login").send({
    email: "admin@test.local",
    password
  });
  const csrf = getCookieValue(res, "csrf_token");
  return { agent, csrf };
}

export async function loginStore(app, password) {
  const agent = request.agent(app);
  const res = await agent.post("/api/v1/auth/login").send({
    email: "store@test.local",
    password
  });
  const csrf = getCookieValue(res, "csrf_token");
  return { agent, csrf };
}

export async function loginCustomer(app, password) {
  const agent = request.agent(app);
  const res = await agent.post("/api/v1/auth/customer/login").send({
    email: "customer@test.local",
    password
  });
  const csrf = getCookieValue(res, "csrf_token");
  return { agent, csrf };
}
