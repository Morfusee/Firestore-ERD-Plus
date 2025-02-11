import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  editProject,
  deleteProject,
  getProjectsByUserId,
  getProjects,
  saveProject,
} from "../controllers/projectController";
import { encryptDataMiddleware } from "@root/middleware/encryptDataMiddleware";
import {
  validate,
  validateRequestBodyNotEmpty,
  validateMembersUpdateRestriction,
  validateProjectId,
  validateProjectFields,
  validateUserId,
  validateUserIdQuery,
  validateDataUpdateRestriction,
  validateProjectData,
  validateOnlyDataField,
} from "@root/middleware/validators/projectValidator";
import { verifyToken } from "@root/middleware/validators/authValidator";


const router = express.Router();

// Define routes for project-related operations

/**
 * GET /projects
 * Fetches all projects associated with a specific user or all projects.
 * Middleware:
 * - validateUserIdQuery: Ensures the provided user ID in the query is valid.
 * - validate: General validation middleware.
 */
router.get("", [verifyToken, validateUserIdQuery, validate], getProjects);

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
 * - validateDataUpdateRestriction: Ensures restrictions on updating project data are enforced.
 * - validateMembersUpdateRestriction: Ensures restrictions on updating project members are enforced.
 * - validate: General validation middleware.
 */
router.patch(
  "/:id",
  [
    validateProjectId,
    validateRequestBodyNotEmpty,
    validateDataUpdateRestriction,
    validateMembersUpdateRestriction,
    validate,
  ],
  editProject
);

/**
 * PATCH /projects/:id/data
 * Updates the data field of a project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validateProjectData: Ensures the provided project data is valid.
 * - validateOnlyDataField: Ensures only the data field is being updated.
 * - validate: General validation middleware.
 *
 */
router.patch(
  "/:id/data",
  [validateProjectId, validateProjectData, validateOnlyDataField, validate],
  saveProject
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
