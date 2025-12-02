import { MongoMemoryServer } from "mongodb-memory-server"
import app from "../app"
import mongoose from "mongoose"
import request from "supertest"
import User from "../models/userModel"
import { beforeAll, afterAll, describe, it, expect, afterEach, beforeEach } from "@jest/globals"
import Project from "../models/projectModel"
import Changelog from "../models/changelogModel"

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

let projectId: string;

beforeEach(async () => {
  const project = await Project.create({ name: "Test Project", icon: "1f600", data: "Random Data chuchu" });
  projectId = project._id.toString();
});

afterEach(async ()=> {
  await Project.deleteMany({})
  await Changelog.deleteMany({})
})

describe("Changelog Tests", () => {

  // Save Project
  it("should create a changelog when saving project data", async () => {
    const response = await request(app)
      .patch(`/projects/${projectId}/data`)
      .send({ data: "Updated Project Data", members: [] });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.message).toBe("Project data saved successfully.");

    const changelog = response.body.data.changelog;
    expect(changelog.data).toBe("Updated Project Data");
    expect(changelog.currentVersion).toBe(true);

    const changelogInDB = await Changelog.findById(changelog.id);
    expect(changelogInDB).not.toBeNull();
  });

  // Get All Changelogs by Project ID
  it("should get all changelogs for a project", async () => {
    await request(app)
      .patch(`/projects/${projectId}/data`)
      .send({ data: "Updated Project Data", members: [] });

    await request(app)
      .patch(`/projects/${projectId}/data`)
      .send({ data: "Updated Project Data Again", members: [] });

    const response = await request(app).get(`/projects/${projectId}/changelogs`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(Array.isArray(response.body.data.changelogs)).toBe(true);
    expect(response.body.data.changelogs.length).toBe(2);

    response.body.data.changelogs.forEach((changelog: any) => {
      expect(changelog.data).toBeUndefined();
    });
  });


  it("should get a single changelog by ID", async () => {
    const project = await request(app)
      .patch(`/projects/${projectId}/data`)
      .send({ data: "Specified Version", members: [] });

    const response = await request(app).get(`/projects/${projectId}/changelogs/${project.body.data.changelog.id}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(200);
    expect(response.body.data.changelog).toBeDefined();
    expect(response.body.data.changelog.data).toBe("Specified Version");
  });

  it("should return 404 if changelog does not exist", async () => {
    const dummyId = new mongoose.Types.ObjectId()

    const response = await request(app).get(`/projects/${projectId}/changelogs/${dummyId}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe(404);
    expect(response.body.message).toBe("Changelog not found.");
  });
})