if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is required to run tests.");
}

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
