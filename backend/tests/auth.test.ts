import request from "supertest";
import app from "../src/app";
import db from "../src/db";

beforeEach((done) => {
  db.run(
    `DELETE FROM users WHERE email IN (?, ?)`,
    ["sarah@example.com", "duplicate@example.com"],
    done
  );
});


describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sarah",
        email: "sarah@example.com",
        password: "Password123!"
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("sarah@example.com");
  });
  describe("POST /api/auth/login", () => {
  beforeEach((done) => {
    db.run(
      `DELETE FROM users WHERE email = ?`,
      ["login@example.com"],
      done
    );
  });

  it("should login with valid credentials", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "Password123!"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "Password123!"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user");
    expect(response.body.user.email).toBe("login@example.com");
  });

  it("should reject incorrect password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "Password123!"
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "WrongPassword!"
      });

    expect(response.status).toBe(401);
  });

  it("should reject non-existent user", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "doesnotexist@example.com",
        password: "Password123!"
      });

    expect(response.status).toBe(401);
  });
});

  it("should reject duplicate email", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Sarah",
        email: "duplicate@example.com",
        password: "Password123!"
      });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another Sarah",
        email: "duplicate@example.com",
        password: "Password123!"
      });

    expect(response.status).toBe(409);
  });

  it("should reject missing fields", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "test@example.com"
      });

    expect(response.status).toBe(400);
  });
});