import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
} from "../controllers/projectController";
import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import {
  validate,
  validateRequestBodyNotEmpty,
  validateMembersUpdateRestriction,
  validateProjectId,
  validateProjectFields,
  validateUserId,
} from "@root/middleware/projectValidator";

const router = express.Router();

// Define routes for project-related operations

/**
 * GET /projects
 * Fetches all projects.
 * No validation or middleware is applied here.
 */
router.get("", getAllProjects);

/**
 * GET /projects/:id
 * Fetches a specific project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validate: General validation middleware.
 */
router.get("/:id", [validateProjectId, validate], getProjectById);

/**
 * PATCH /projects/:id
 * Updates an existing project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validateRequestBodyNotEmpty: Ensures the request body is not empty.
 * - validateMembersUpdateRestriction: Ensures restrictions on updating project members are enforced.
 * - validate: General validation middleware.
 */
router.patch(
  "/:id",
  [
    validateProjectId,
    validateRequestBodyNotEmpty,
    validateMembersUpdateRestriction,
    validate,
  ],
  editProject
);

/**
 * POST /projects
 * Creates a new project.
 * Middleware:
 * - validateProjectFields: Ensures required project fields are present and valid.
 * - validateUserId: Ensures the provided user ID is valid.
 * - validate: General validation middleware.
 */
router.post(
  "",
  [...validateProjectFields, validateUserId, validate],
  createProject
);

/**
 * DELETE /projects/:id
 * Deletes a project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validate: General validation middleware.
 */
router.delete("/:id", [validateProjectId, validate], deleteProject);

export default router;
