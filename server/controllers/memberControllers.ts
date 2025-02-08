import ConflictError from "@root/errors/ConflictError"
import NotFoundError from "@root/errors/NotFoundError"
import Project from "@root/models/projectModel"
import User from "@root/models/userModel"
import { MemberBody, MemberParams, MemberRoleBody, ProjectParams } from "@root/types/memberTypes"
import { NextFunction, Request, Response } from "express"
import SuccessResponse from "@root/success/SuccessResponse.ts";



export const getMembersByProjectId = async (
  req: Request<ProjectParams, {}, MemberBody>, 
  res: Response,
  next: NextFunction
) => {

  const { projectId } = req.params

  try {
    // Check if ObjectId in url params is valid

    // Check if project exists
    const project = await Project.findById(projectId).select('-data -members')
    if (!project) throw new NotFoundError('Project not found')
 
    // Query for Member document
    const members = await Project.findById(projectId)
      .select('members')
      .populate({
        path: 'members.userId',
        select: 'username email displayName'
      })
      .lean()
      .exec()
    if (!members) throw new NotFoundError('Member list not found')
    
    const cleanedMembers = members.members.map(({ _id, ...rest }) => rest)

    next(
      new SuccessResponse("Members fetched successfully.", {
        members: cleanedMembers,
      })
    )
    // Todo: Pagination
  } catch (error) {
    next(error)
  }
}

export const addMember = async (
  req: Request<ProjectParams, {}, MemberBody>, 
  res: Response,
  next: NextFunction
) => {

  const { projectId } = req.params
  const { userId, role } = req.body

  try {
    // Check if ObjectId in url params is valid
    // Check if the body either has userId and role
    // Check if ObjectId in body is valid

    // Check if project exists
    const project = await Project.findById(projectId).select('-data -members')
    if (!project) throw new NotFoundError('Project not found')

    // Check if member exists
    const user = await User.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Check if member is already in the member list
    const isMember = await Project.exists({
      _id: project.id,
      'members.userId': user.id,
    })
    if (isMember) throw new ConflictError('User is already a member of this project')

    // Check if the role of the one adding is an owner or admin
    // TODO when auth is implemented

    const memberData = { userId: user.id, role: role || 'viewer' }

    // Add member to project
    await project.updateOne(
      { $push: { members: memberData } }
    )
    // Add project to user
    await user.updateOne(
      { $push: { sharedProjects: project.id }}
    )

    next(
      new SuccessResponse("Member has been added successfully.", {
        addedMember: memberData,
      })
    )

  } catch (error) {
    next(error)
  }
}

export const editMemberRole = async (
  req: Request<MemberParams, {}, 
  MemberRoleBody>, res: Response,
  next: NextFunction
) => {

  const { projectId, userId } = req.params
  const { role } = req.body

  try {
    // Check if ObjectId in url params are valid
    // Check if the body only has role field
    // Check if the role is valid

    // Check if project exists
    const project = await Project.findById(projectId).select('-data -members')
    if (!project) throw new NotFoundError('Project not found')

    // Check if member exists
    const user = await User.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Check if member is already in the member list
    const member = await Project.findOne(
      { _id: projectId },
      { members: { $elemMatch: { userId: user.id }}}
    )
    if (!member) throw new NotFoundError('Member not found')
    if (member?.members.length == 0) 
      throw new ConflictError('The user is not a member of the project')

    // Check the member's role if it's an owner
    if (member.members[0].role === 'owner')
      throw new ConflictError(`Unable to change owner role`)

    // Check if the role of the one editing is either an owner or admin
    // TODO when auth is implemented

    // Edit role of the member
    await project.updateOne(
      { $set: { 'members.$[member].role': role } },
      { arrayFilters: [{ 'member.userId': user.id }] }
    )

    next(
      new SuccessResponse("Member role has been updated successfully.", {
        updatedMember: { userId: user.id, role: role },
      })
    )

  } catch (error) {
    next(error)
  }

}

export const removeMember = async (
  req: Request<MemberParams, {}, {}>, 
  res: Response,
  next: NextFunction
) => {

  const { projectId, userId } = req.params

  try {
    // Check if ObjectId in url params are valid
    // Check if the body only has role field

    // Check if project exists
    const project = await Project.findById(projectId).select('-data -members')
    if (!project) throw new NotFoundError('Project not found')

    // Check if member exists
    const user = await User.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    // Check if member is already in the member list
    const member = await Project.findOne(
      { _id: projectId },
      { members: { $elemMatch: { userId: user.id }}}
    )
    if (!member) throw new NotFoundError('Member not found')
    if (member?.members.length == 0) 
      throw new ConflictError('The user is not a member of the project')

    // Check the member's role if it's an owner
    if (member.members[0].role === 'owner')
      throw new ConflictError(`Cannot remove owner from the project`)

    // Check if the role of the one removing is either an owner or admin
    // TODO when auth is implemented

    // Remove member from the project
    await project.updateOne(
      { $pull: { members: { userId: user.id } }}
    )
    // Remove project from the user
    await user.updateOne(
      { $pull: { sharedProjects: project.id }}
    )

    next(
      new SuccessResponse("Member has been removed successfully.", {
        deletedMemberId: user.id,
      })
    )

  } catch (error) {
    next(error)
  }

}