import request from "supertest";
import app from "../src/app";
import db from "../src/db";

let userToken: string;
let adminToken: string;
let vehicleId: number;

beforeAll(async () => {
  // Create normal user
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Vehicle User",
      email: "vehicleuser@example.com",
      password: "Password123!"
    });

  const userLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "vehicleuser@example.com",
      password: "Password123!"
    });

  userToken = userLogin.body.token;

  // Login as seeded admin
  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@example.com",
      password: "Admin123!"
    });

  adminToken = adminLogin.body.token;
});

afterAll((done) => {
  db.run(
    `DELETE FROM vehicles WHERE make = ?`,
    ["TestMake"],
    done
  );
});

describe("Vehicle API", () => {

  it("should get all vehicles", async () => {
    const response = await request(app)
      .get("/api/vehicles");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should search vehicles by make", async () => {
    const response = await request(app)
      .get("/api/vehicles/search")
      .query({ make: "Toyota" });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should reject vehicle creation without authentication", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .send({
        make: "TestMake",
        model: "TestModel",
        category: "SUV",
        price: 30000,
        quantity: 2
      });

    expect(response.status).toBe(401);
  });

  it("should reject vehicle creation for normal user", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        make: "TestMake",
        model: "TestModel",
        category: "SUV",
        price: 30000,
        quantity: 2
      });

    expect(response.status).toBe(403);
  });

  it("should allow admin to create vehicle", async () => {
    const response = await request(app)
      .post("/api/vehicles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "TestMake",
        model: "TestModel",
        category: "SUV",
        price: 30000,
        quantity: 2
      });

    expect(response.status).toBe(201);

    expect(response.body.vehicle).toHaveProperty("id");

    vehicleId = response.body.vehicle.id;
  });

  it("should allow authenticated user to purchase vehicle", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
  });

  it("should allow admin to restock vehicle", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        quantity: 5
      });

    expect(response.status).toBe(200);
  });

  it("should reject normal user from restocking", async () => {
    const response = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        quantity: 5
      });

    expect(response.status).toBe(403);
  });

  it("should allow admin to update vehicle", async () => {
    const response = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        make: "TestMake",
        model: "UpdatedModel",
        category: "Sedan",
        price: 35000,
        quantity: 10
      });

    expect(response.status).toBe(200);
  });

  it("should allow admin to delete vehicle", async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });
});