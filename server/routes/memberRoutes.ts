import {
  addMember,
  editGeneralAccess,
  editMemberRole,
  getMemberRoleById,
  getMembersByProjectId,
  removeMember,
} from "@root/controllers/memberControllers";
import { validateToken } from "@root/middleware/validators/authValidator";
import { checkRole } from "@root/middleware/validators/memberRoleValidator";
import {
  validate,
  validateProjectId,
  validateRoleOptional,
  validateRoleRequired,
  validateUserId,
  validateAccessType,
  validateAccessRole,
} from "@root/middleware/validators/memberValidator";
import { Router } from "express";

const router = Router();

router.get(
  "/:projectId/members",
  [validateToken, validateProjectId, validate],
  checkRole(["Viewer", "Editor", "Admin", "Owner"]),
  getMembersByProjectId
);
router.post(
  "/:projectId/members",
  [
    validateToken,
    validateProjectId,
    validateRoleOptional,
    validate,
  ],
  checkRole(["Editor", "Admin", "Owner"]),
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
  checkRole(["Admin", "Owner"]),
  editMemberRole
);
router.get(
  "/:projectId/members/:userId",
  [
    validateToken,
    validateProjectId,
    validateUserId,
    validate,
  ],
  checkRole(["Viewer", "Editor", "Admin", "Owner"]),
  getMemberRoleById
);
router.delete(
  "/:projectId/members/:userId",
  [validateToken, validateProjectId, validateUserId, validate],
  checkRole(["Admin", "Owner"]),
  removeMember
);
router.patch(
  "/:projectId/access",
  [
    validateToken,
    validateProjectId,
    validateAccessType,
    validateAccessRole,
    validate
  ],
  checkRole(["Admin", "Owner"]),
  editGeneralAccess
)

export default router;
