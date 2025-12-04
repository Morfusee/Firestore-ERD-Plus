import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import mongoose from "mongoose";
import request from "supertest";
import User from "../models/userModel";
import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
  afterEach,
  beforeEach,
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

afterEach(async () => {
  await User.deleteMany({});
});

let testUserId: string;

beforeEach(async () => {
  const user = await User.create({
    username: "testuser",
    email: "test@email.com",
    displayName: "Test User",
  });
  testUserId = user._id.toString();
});

describe("Settings Tests", () => {
  it("should create settings after creating a user", async () => {
    const res = await request(app).get(`/users/${testUserId}/settings`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("Settings fetched successfully.");
    expect(res.body.data.settings).toHaveProperty("id");
    expect(res.body.data.settings.theme).toBe("Light");
  });

  it("should return 404 for not found user", async () => {
    const dummyId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/users/${dummyId}/settings`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
    expect(res.body.message).toBe("User not found.");
  });

  it("should update a user's settings", async () => {
    const res = await request(app).patch(`/users/${testUserId}/settings`).send({
      theme: "Dark",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(200);
    expect(res.body.message).toBe("Settings updated successfully.");
    expect(res.body.data.updatedSettings).toHaveProperty("id");
    expect(res.body.data.updatedSettings.theme).toBe("Dark");
  });

  it("should return 400 when updating invalid fields", async () => {
    const res = await request(app).patch(`/users/${testUserId}/settings`).send({
      theme: "Blue",
    });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.message).toBe("Missing or invalid required fields.");
  });
});
