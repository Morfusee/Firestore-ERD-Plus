import ValidationError from "@root/errors/ValidationError";
import Project from "@root/models/projectModel"
import { Response, NextFunction } from "express";

const getMemberRole = async (projectId: string, userId: string) => {
  const project = await Project.findOne(
    { _id: projectId, "members.userId": userId },
    { "members.$": 1 }
  );

  console.log(projectId, userId)

  if (!project || project.members.length === 0) {
    console.log("Project or member not found")
    return null;
  }

  console.log("Got the member role")
  return project.members[0].role;
}

export const checkRole = (allowedRoles: string[]) => async (req: any, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params;
    const userId = req.passport;

    console.log(req.user)
  
    const role = await getMemberRole(projectId, userId)
  
    if (!role || !allowedRoles.includes(role)) 
      throw new ValidationError("Access denied")
    
    next()
  } catch (error) {
    next(error)
  }
}