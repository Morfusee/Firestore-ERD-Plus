import ConflictError from "@root/errors/ConflictError";
import NotFoundError from "@root/errors/NotFoundError";
import Project from "@root/models/projectModel";
import User from "@root/models/userModel";
import {
  MemberBody,
  MemberParams,
  MemberRoleBody,
  ProjectParams,
} from "@root/types/memberTypes";
import { NextFunction, Request, Response } from "express";
import SuccessResponse from "@root/success/SuccessResponse.ts";

export const getMembersByProjectId = async (
  req: Request<ProjectParams, {}, MemberBody>,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;

  try {
    // Check if ObjectId in url params is valid

    // Check if project exists
    const project = await Project.findById(projectId).select("-data -members");
    if (!project) throw new NotFoundError("Project not found");

    // Query for Member document
    const members = await Project.findById(projectId)
      .select("members")
      .populate({
        path: "members.userId",
        select: "username profilePicture displayName",
      })
      .lean()
      .exec();

    if (!members) throw new NotFoundError("Member list not found");

    const cleanedMembers = members.members.map(({ userId, role }: any) => {
      if (typeof userId === "object" && userId !== null) {
        return {
          id: userId._id,
          profilePicture: userId.profilePicture || "",
          username: userId.username,
          displayName: userId.displayName,
          role,
        };
      }
      return { id: userId, role };
    });

    next(
      new SuccessResponse("Members fetched successfully.", {
        members: cleanedMembers,
      })
    );
    // Todo: Pagination
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: Request<ProjectParams, {}, MemberBody>,
  res: Response,
  next: NextFunction
) => {
  const { projectId } = req.params;
  const { username, role } = req.body;

  try {
    console.log("addMember: Request body:", req.body);
    console.log("addMember: Request params:", req.params);

    // Check if ObjectId in url params is valid
    // Check if the body either has email and role
    // Check if email is valid

    // Check if project exists
    const project = await Project.findById(projectId).select("-data -members");
    if (!project) throw new NotFoundError("Project not found");

    console.log("addMember: Project found:", project);

    // Check if member exists by email
    const user = await User.findOne({ username });
    if (!user) throw new NotFoundError("User not found");

    console.log("addMember: User found:", user);

    // Check if member is already in the member list
    const isMember = await Project.exists({
      _id: project.id,
      "members.userId": user.id,
    });
    if (isMember)
      throw new ConflictError(
        "User with this email is already a member of this project"
      );

    console.log("addMember: User is not a member of the project");

    // Check if the role of the one adding is an owner or admin
    // TODO when auth is implemented

    const memberData = { userId: user.id, role: role || "Viewer" };

    console.log("addMember: Member data to be added:", memberData);

    // Add member to project
    await project.updateOne({ $push: { members: memberData } });

    // Add project to user
    await user.updateOne({ $push: { sharedProjects: project.id } });

    console.log("addMember: Member added successfully");

    next(
      new SuccessResponse("Member has been added successfully.", {
        addedMember: memberData,
      })
    );
  } catch (error) {
    console.log("addMember: Error:", error);
    next(error);
  }
};

export const editMemberRole = async (
  req: Request<MemberParams, {}, MemberRoleBody>,
  res: Response,
  next: NextFunction
) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  try {
    // Check if ObjectId in url params are valid
    // Check if the body only has role field
    // Check if the role is valid

    // Check if project exists
    const project = await Project.findById(projectId).select("-data -members");
    if (!project) throw new NotFoundError("Project not found");

    // Check if member exists
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Check if member is already in the member list
    const member = await Project.findOne(
      { _id: projectId },
      { members: { $elemMatch: { userId: user.id } } }
    );
    if (!member) throw new NotFoundError("Member not found");
    if (member?.members.length == 0)
      throw new ConflictError("The user is not a member of the project");

    // Check the member's role if it's an owner
    if (member.members[0].role === "Owner")
      throw new ConflictError(`Unable to change owner role`);

    // Check if the role of the one editing is either an owner or admin
    // TODO when auth is implemented

    // Edit role of the member
    await project.updateOne(
      { $set: { "members.$[member].role": role } },
      { arrayFilters: [{ "member.userId": user.id }] }
    );

    next(
      new SuccessResponse("Member role has been updated successfully.", {
        updatedMember: { userId: user.id, role: role },
      })
    );
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: Request<MemberParams, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const { projectId, userId } = req.params;

  try {
    // Check if ObjectId in url params are valid
    // Check if the body only has role field

    // Check if project exists
    const project = await Project.findById(projectId).select("-data -members");
    if (!project) throw new NotFoundError("Project not found");

    // Check if member exists
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Check if member is already in the member list
    const member = await Project.findOne(
      { _id: projectId },
      { members: { $elemMatch: { userId: user.id } } }
    );
    if (!member) throw new NotFoundError("Member not found");
    if (member?.members.length == 0)
      throw new ConflictError("The user is not a member of the project");

    // Check the member's role if it's an owner
    if (member.members[0].role === "Owner")
      throw new ConflictError(`Cannot remove owner from the project`);

    // Check if the role of the one removing is either an owner or admin
    // TODO when auth is implemented

    // Remove member from the project
    await project.updateOne({ $pull: { members: { userId: user.id } } });
    // Remove project from the user
    await user.updateOne({ $pull: { sharedProjects: project.id } });

    next(
      new SuccessResponse("Member has been removed successfully.", {
        deletedMemberId: user.id,
      })
    );
  } catch (error) {
    next(error);
  }
};
