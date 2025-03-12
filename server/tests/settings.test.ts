import { MongoMemoryServer } from "mongodb-memory-server"
import app from "../app"
import mongoose from "mongoose"
import request from "supertest"
import User from "../models/userModel"
import { beforeAll, afterAll, describe, it, expect, afterEach } from "@jest/globals"

let mongoServer: MongoMemoryServer

beforeAll(async () => {
  process.env.NODE_ENV = "test"
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)

})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})


afterEach(async ()=> {
  await User.deleteMany({})
})

describe("Settings Tests", () => {

  it("should create settings after creating a user", async () => {
    const user = await request(app)
      .post("/users")
      .send({
        username: "testuser",
        email: "test@email.com",
        displayName: "Test User"
      })

    const res = await request(app)
      .get(`/users/${user.body.data.createdUser.id}/settings`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Settings fetched successfully.")
    expect(res.body.data.settings).toHaveProperty("id")
    expect(res.body.data.settings.theme).toBe("Light")
  })

  it("should return 404 for not found user", async () => {
    const dummyId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .get(`/users/${dummyId}/settings`)

      expect(res.status).toBe(404)
      expect(res.body.status).toBe(404)
      expect(res.body.message).toBe('User not found.')
  })

  it("should update a user's settings", async () => {
    const user = await request(app)
    .post("/users")
    .send({
      username: "testuser",
      email: "test@email.com",
      displayName: "Test User"
    })

    const res = await request(app)
      .patch(`/users/${user.body.data.createdUser.id}/settings`)
      .send({
        theme: "Dark"
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Settings updated successfully.")
    expect(res.body.data.updatedSettings).toHaveProperty("id")
    expect(res.body.data.updatedSettings.theme).toBe("Dark")
  })

  it("should return 400 when updating invalid fields", async () => {
    const user = await request(app)
    .post("/users")
    .send({
      username: "testuser",
      email: "test@email.com",
      displayName: "Test User"
    })

    const res = await request(app)
      .patch(`/users/${user.body.data.createdUser.id}/settings`)
      .send({
        theme: "Blue"
      })

    expect(res.status).toBe(400)
    expect(res.body.status).toBe(400)
    expect(res.body.message).toBe("Missing or invalid required fields.")
  })

})