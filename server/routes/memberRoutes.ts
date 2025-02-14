import {
  addMember,
  editMemberRole,
  getMembersByProjectId,
  removeMember,
} from "@root/controllers/memberControllers";
import { validateToken } from "@root/middleware/validators/authValidator";
import {
  validate,
  validateProjectId,
  validateRoleOptional,
  validateRoleRequired,
  validateUserId,
} from "@root/middleware/validators/memberValidator";
import { Router } from "express";

const router = Router();

router.get(
  "/:projectId/members",
  [validateToken, validateProjectId, validate],
  getMembersByProjectId
);
router.post(
  "/:projectId/members",
  [
    validateToken,
    validateProjectId,
    validateUserId,
    validateRoleOptional,
    validate,
  ],
  addMember
);
router.patch(
  "/:projectId/members/:userId",
  [
    validateToken,
    validateProjectId,
    validateUserId,
    validateRoleRequired,
    validate,
  ],
  editMemberRole
);
router.delete(
  "/:projectId/members/:userId",
  [validateToken, validateProjectId, validateUserId, validate],
  removeMember
);

export default router;
