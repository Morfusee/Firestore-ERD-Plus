import { MongoMemoryServer } from "mongodb-memory-server"
import app from "../app"
import mongoose from "mongoose"
import request from "supertest"
import User from "../models/userModel"
import { beforeAll, afterAll, beforeEach, describe, it, expect, afterEach } from "@jest/globals"
import Project from "../models/projectModel"

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

let testUserId: string

beforeEach(async () => {
  const user = await User.create({
    username: "doggy_slayer",
    email: "dog@email.com",
    displayName: "Doggy Patuti",
  })
  testUserId = user._id.toString()
})

afterEach(async ()=> {
  await User.deleteMany({})
  await Project.deleteMany({})
})

describe("Project Tests", () => {

  it("should create a new project", async () => {
    const res = await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe(201)
    expect(res.body.message).toBe("Project saved successfully.")
    expect(res.body.data.createdProject).toHaveProperty("id")
    expect(res.body.data.createdProject.name).toBe("Test Project")
  })

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/projects")
      .send({ icon: "1f600", userId: testUserId  })

    expect(res.status).toBe(400)
    expect(res.body.status).toBe(400)
    expect(res.body.message).toBe("Missing or invalid required fields.")
  })

  it("should fetch all projects", async () => {

    await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    const res = await request(app).get("/projects");

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Successfully fetched all projects.")
    expect(res.body.data.projects.length).toBe(1)
  })

  it("should fetch projects by userId", async () => {
    await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    await request(app)
      .post("/projects")
      .send({ name: "Test2 Project", icon: "1f600", userId: testUserId })

    const res = await request(app).get(`/users/${testUserId}/projects`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Projects successfully fetched.")
    expect(res.body.data.projects.length).toBe(2)
  })

  it("should return 404 if user not found when fetching projects by userId", async () => {
    await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    const dummyId = new mongoose.Types.ObjectId()
    const res = await request(app).get(`/users/${dummyId}/projects`)

    expect(res.status).toBe(404)
    expect(res.body.status).toBe(404)
    expect(res.body.message).toBe("User not found.")
  })

  it("should fetch a project by ID", async () => {
    const project = await request(app)
      .post("/projects")
      .send({ name: "Test Single Project", icon: "1f600", userId: testUserId })
    
    const res = await request(app).get(`/projects/${project.body.data.createdProject.id}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Successfully fetched the project.")
    expect(res.body.data.project.name).toBe("Test Single Project")
  })

  it("should return 404 if project not found", async () => {
    await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    const dummyId = new mongoose.Types.ObjectId()
    const res = await request(app).get(`/projects/${dummyId}`)

    expect(res.status).toBe(404)
    expect(res.body.status).toBe(404)
    expect(res.body.message).toBe("Project not found.")
  })

  it("should update a project", async () => {
    const project = await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    const res = await request(app)
      .patch(`/projects/${project.body.data.createdProject.id}`)
      .send({ name: "Updated Project" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Project updated successfully.")
    expect(res.body.data.updatedProject.name).toBe("Updated Project")
  })

  it("should delete a project", async () => {
    const project = await request(app)
      .post("/projects")
      .send({ name: "Test Project", icon: "1f600", userId: testUserId })

    const projectId = project.body.data.createdProject.id

    const res = await request(app).delete(`/projects/${projectId}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Project deleted successfully.")
    expect(res.body.data.deletedProjectId).toBe(projectId.toString())

    const deletedProject = await Project.findById(projectId)
    expect(deletedProject).toBeNull()
  })

})