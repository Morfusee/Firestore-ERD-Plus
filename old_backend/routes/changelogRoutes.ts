import {
  getChangelogsByProjectId,
  getChangelogById,
} from "@root/controllers/changelogControllers";
import { validateToken } from "@root/middleware/validators/authValidator";
import {
  validate,
  validateChangelogId,
  validateProjectId,
} from "@root/middleware/validators/changelogValidator";
import { Router } from "express";

const router = Router();

router.get(
  "/:projectId/changelogs",
  [validateToken, validateProjectId, validate],
  getChangelogsByProjectId
);

router.get(
  "/:projectId/changelogs/:changelogId",
  [validateToken, validateProjectId, validateChangelogId, validate],
  getChangelogById
);

export default router;
