import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import mongoose from "mongoose";
import request from "supertest";
import User from "../models/userModel";
import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  afterEach,
} from "@jest/globals";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

let testUserId: string;

beforeEach(async () => {
  const user = await User.create({
    username: "doggy_slayer",
    email: "dog@email.com",
    displayName: "Doggy Patuti",
  });
  testUserId = user._id.toString();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe("User Tests", () => {
  it("should return a list with 1 default user", async () => {
    const res = await request(app).post("/users/search").send({
      username: "",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("Users fetched successfully.");
    expect(res.body.data.users).toBeInstanceOf(Array);
    expect(res.body.data.users.length).toBeGreaterThan(0);
  });

  it("should get a user by ID", async () => {
    const res = await request(app).get(`/users/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("User fetched successfully.");
    expect(res.body.data.user.username).toBe("doggy_slayer");
  });

  it("should return 404 for not found user", async () => {
    const dummyId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/users/${dummyId}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  it("should fetch all owned projects by user ID", async () => {
    const createProjectRes = await request(app).post("/projects").send({
      name: "Test Project",
      icon: "test-icon",
      userId: testUserId,
    });

    const res = await request(app).get(`/users/${testUserId}/projects`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("Projects successfully fetched.");
    expect(res.body.data.projects.length).toBeGreaterThan(0);
    expect(res.body.data.projects[0].name).toEqual("Test Project");
    expect(res.body.data.projects[0].icon).toEqual("test-icon");
  });

  it("should create a user", async () => {
    const res = await request(app).post("/users").send({
      username: "testuser",
      email: "test@email.com",
      displayName: "Test User",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(201);
    expect(res.body.message).toBe("User created successfully.");
    expect(res.body.data.createdUser).toHaveProperty("id");
    expect(res.body.data.createdUser).toHaveProperty("username", "testuser");
    expect(res.body.data.createdUser).toHaveProperty("token", "");
    expect(res.body.data.createdUser.ownedProjects).toEqual([]);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/users").send({
      email: "test@email.com",
    });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBe("Missing or invalid required fields.");
  });

  it("should update a user", async () => {
    const res = await request(app).patch(`/users/${testUserId}`).send({
      displayName: "John Cena",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("User updated successfully.");
    expect(res.body.data.updatedUser.displayName).toBe("John Cena");
  });

  it("should return 404 if updating a not found user", async () => {
    const dummyId = new mongoose.Types.ObjectId();
    const res = await request(app).patch(`/users/${dummyId}`).send({
      displayName: "John Cena",
    });
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  it("should get user by username", async () => {
    const res = await request(app).post("/users/search").send({
      username: "doggy_slayer",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("Users fetched successfully.");
    expect(res.body.data.users.length).toBeGreaterThan(0);
    expect(res.body.data.users[0].username).toBe("doggy_slayer");
  });

  it("should delete a user", async () => {
    const res = await request(app).delete(`/users/${testUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("User deleted successfully.");
  });

  it("should return 404 when deleting not found user", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/users/${nonExistentId}`);
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });
});
