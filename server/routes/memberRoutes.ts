import { addMember, editMemberRole, getMembersByProjectId, removeMember } from "@root/controllers/memberControllers";
import { validate, validateProjectId, validateRoleOptional, validateRoleRequired, validateUserId } from "@root/middleware/validators/memberValidator";
import { Router } from "express";


const router = Router();

router.get(
  "/:projectId/members", 
  [validateProjectId, validate], 
  getMembersByProjectId
)
router.post(
  "/:projectId/members",
  [validateProjectId, validateUserId, validateRoleOptional, validate],
  addMember
)
router.patch(
  "/:projectId/members/:userId",
  [validateProjectId, validateUserId, validateRoleRequired, validate], 
  editMemberRole
)
router.delete(
  "/:projectId/members/:userId",
  [validateProjectId, validateUserId, validate], 
  removeMember
)

export default router;