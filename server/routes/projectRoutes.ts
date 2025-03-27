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
import { validateToken } from "@root/middleware/validators/authValidator";
import { checkRole } from "@root/middleware/validators/memberRoleValidator";

const router = express.Router();

// Define routes for project-related operations

/**
 * GET /projects
 * Fetches all projects associated with a specific user or all projects.
 * Middleware:
 * - validateUserIdQuery: Ensures the provided user ID in the query is valid.
 * - validate: General validation middleware.
 */
router.get("", [validateToken, validateUserIdQuery, validate], getProjects);

/**
 * GET /projects/:id
 * Fetches a specific project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validate: General validation middleware.
 */
router.get(
  "/:projectId", 
  [validateToken, validateProjectId, validate], 
  checkRole(["Viewer", "Editor", "Admin", "Owner"]), 
  getProjectById
);

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
  "/:projectId",
  [
    validateToken,
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
  "/:projectId/data",
  [
    validateToken,
    validateProjectId,
    validateProjectData,
    validateOnlyDataField,
    validate,
  ],
  checkRole(["Viewer", "Editor", "Admin", "Owner"]), 
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
  [validateToken, ...validateProjectFields, validateUserId, validate],
  createProject
);

/**
 * DELETE /projects/:id
 * Deletes a project by its ID.
 * Middleware:
 * - validateProjectId: Ensures the provided project ID is valid.
 * - validate: General validation middleware.
 */
router.delete(
  "/:projectId",
  [validateToken, validateProjectId, validate],
  deleteProject
);

export default router;
