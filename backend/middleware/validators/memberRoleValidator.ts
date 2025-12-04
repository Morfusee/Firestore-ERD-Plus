import NotFoundError from "@root/errors/NotFoundError";
import ValidationError from "@root/errors/ValidationError";
import Project from "@root/models/projectModel"
import User from "@root/models/userModel";
import { Response, NextFunction } from "express";


const getMemberByEmail = async (email: string) => {
  const user = await User.findOne(
    { email: email }
  )

  if (!user) {
    console.log("User not found")
    throw new NotFoundError("User not found");
  }
  
  return user._id.toString()
}

const getMemberRole = async (projectId: string, userId: string) => {
  const project = await Project.findById(projectId).select("members generalAccess");

  if (!project) {
    console.log("Project not found")
    throw new NotFoundError("Project not found");
  }

  const member = project.members.find((user) => user.userId.toString() === userId);
  const memberRole = member ? member.role : null;
  const generalRole = project.generalAccess?.role || null;
  const accessType = project.generalAccess?.accessType || "Restricted";

  if (accessType === "Restricted" && !memberRole) {
    console.log("Access denied: User is not a member of the project.");
    throw new NotFoundError("Access denied: User is not a member.");
  }

  return { memberRole, generalRole };
}

export const checkRole = (allowedRoles: string[]) => async (req: any, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const userId = await getMemberByEmail(req.user.email);
  
    const { memberRole, generalRole } = await getMemberRole(projectId, userId)
  
    const hasAccess = (memberRole && allowedRoles.includes(memberRole)) || (generalRole && allowedRoles.includes(generalRole));

    if (!hasAccess) {
      throw new ValidationError("Access denied: Insufficient permissions.");
    }

    req.userId = userId;
    
    next()
  } catch (error) {
    next(error)
  }
}