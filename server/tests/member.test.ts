import { MongoMemoryServer } from "mongodb-memory-server"
import app from "../app"
import mongoose from "mongoose"
import request from "supertest"
import User from "../models/userModel"
import { beforeAll, afterAll, describe, it, expect, afterEach, beforeEach } from "@jest/globals"
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

let ownerId: string, user1Id: string, user2Id: string, projectId: string

beforeEach(async () => {
  const owner = await request(app).post("/users")
    .send({ username: "owner_user", email: "owner@email.com", displayName: "Owner CEO" })
  const user1 = await request(app).post("/users")
    .send({ username: "user_one1", email: "user1@email.com", displayName: "User One" })
  const user2 = await request(app).post("/users")
    .send({ username: "user_two2", email: "user2@email.com", displayName: "User Two" })

  ownerId = owner.body.data.createdUser.id
  user1Id = user1.body.data.createdUser.id
  user2Id = user2.body.data.createdUser.id

  const project = await request(app)
    .post("/projects")
    .send({ name: "Test Project", icon: "1f600", userId: ownerId })

  projectId = project.body.data.createdProject.id
})

afterEach(async ()=> {
  await User.deleteMany({})
  await Project.deleteMany({})
})

describe("Members Tests", () => {

  // Get project's memebrs
  it("should fetch members of a project", async () => {
    const res = await request(app).get(`/projects/${projectId}/members`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Members fetched successfully.")
    expect(res.body.data.members).toHaveLength(1)
    expect(res.body.data.members[0].username).toBe("owner_user")
    expect(res.body.data.members[0].role).toBe("owner")
  })

  it("should return 404 if project not found", async () => {
    const dummyId = new mongoose.Types.ObjectId()
    const res = await request(app).get(`/projects/${dummyId}/members`)
    expect(res.status).toBe(404)
    expect(res.body.status).toBe(404)
    expect(res.body.message).toBe("Project not found")
  })

  // Add member
  it("should add a new member to the project", async () => {
    const res = await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: user2Id, role: "viewer" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Member has been added successfully.")
    expect(res.body.data.addedMember.userId).toBe(user2Id)

    const updatedProject = await Project.findById(projectId)
    expect(updatedProject!.members).toHaveLength(2)

    const updatedUser = await User.findById(user2Id)
    expect(updatedUser?.sharedProjects.map(item => item.toString())).toContain(projectId)
  })

  it("should return 409 if user is already a member", async () => {
    await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: user1Id, role: "viewer" })

    const res = await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: user1Id, role: "viewer" })

    expect(res.status).toBe(409)
    expect(res.body.status).toBe(409)
    expect(res.body.message).toBe("User is already a member of this project")
  })

  it("should return 404 if user does not exist", async () => {
    const dummyId = new mongoose.Types.ObjectId()
    const res = await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: dummyId, role: "viewer" })

    expect(res.status).toBe(404)
    expect(res.body.status).toBe(404)
    expect(res.body.message).toBe("User not found")
  })

  // Edit role
  it("should update a member's role", async () => {
    await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: user1Id, role: "viewer" })

    const res = await request(app)
      .patch(`/projects/${projectId}/members/${user1Id}`)
      .send({ role: "admin" })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Member role has been updated successfully.")
    expect(res.body.data.updatedMember.role).toBe("admin")

    const updatedProject = await Project.findById(projectId)
    expect(updatedProject!.members.find((m) => m.userId.equals(user1Id))!.role).toBe("admin")
  })

  it("should not allow changing the owner's role", async () => {
    const res = await request(app)
      .patch(`/projects/${projectId}/members/${ownerId}`)
      .send({ role: "admin" })

    expect(res.status).toBe(409)
    expect(res.body.message).toBe("Unable to change owner role")
  })

  // Remove Member
  it("should remove a member from the project", async () => {
    await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ userId: user2Id, role: "viewer" })

    const res = await request(app).delete(`/projects/${projectId}/members/${user2Id}`)

    expect(res.status).toBe(200)
    expect(res.body.status).toBe(200)
    expect(res.body.message).toBe("Member has been removed successfully.")
    expect(res.body.data.deletedMemberId).toBe(user2Id)

    const updatedProject = await Project.findById(projectId)
    expect(updatedProject!.members).toHaveLength(1)

    const updatedUser = await User.findById(user2Id)
    expect(updatedUser?.sharedProjects).toHaveLength(0)
  })

  it("should not allow removing the owner", async () => {
    const res = await request(app).delete(`/projects/${projectId}/members/${ownerId}`)

    expect(res.status).toBe(409)
    expect(res.body.status).toBe(409)
    expect(res.body.message).toBe("Cannot remove owner from the project")
  })

})