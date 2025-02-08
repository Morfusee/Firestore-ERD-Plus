import { getChangelogsByProjectId, getChangelogById } from "@root/controllers/changelogControllers";
import { validate, validateChangelogId, validateProjectId } from "@root/middleware/validators/changelogValidator";
import { Router } from "express";


const router = Router();

router.get(
  "/:projectId/changelogs", 
  [validateProjectId, validate],
  getChangelogsByProjectId
)

router.get(
  "/:projectId/changelogs/:changelogId", 
  [validateProjectId, validateChangelogId, validate],
  getChangelogById
)

export default router