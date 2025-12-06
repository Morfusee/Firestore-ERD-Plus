import { IChangelog } from "../store/useChangelogStore";
import { IUser } from "../store/useUserStore";
import { EmojiData } from "./EmojiData";
import { IProject, IProjectMembers, MemberRole } from "./ProjectTypes";

export interface APIResponse<T> {
  success: boolean;
  message: string;
  statusText: "OK";
  data: T;
  error:
    | string
    | {
        code: string;
      };
}

// Projects
export interface CreatedProject {
  createdProject: IProject;
}

export interface UpdatedProject {
  updatedProject: IProject;
}

export interface FetchedProject {
  project: IProject;
  userRole: MemberRole;
}

export interface FetchedProjects {
  projects: IProject[];
}

export interface SavedProject {
  project: IProject;
  changelog: IChangelog;
}

export interface DeletedProject {
  deletedProjectId: string;
}

export interface FetchedProjectMembers {
  members: IProjectMembers[];
}

export interface FetchedMemberRole {
  role: MemberRole;
}

export interface CreatedProjectMember {
  createdMember: IProjectMembers;
}

export interface UpdatedProjectMember {
  updatedMember: IProjectMembers;
}

export interface DeletedProjectMember {
  deletedMember: IProjectMembers;
}

// Users
export interface CreatedUser {
  createdUser: IUser;
}

export interface FetchedUser {
  user: IUser;
  token: string;
}

export interface FetchedUsers {
  // Omit email from the response
  users: Omit<IUser, "email">[];
}

export interface UpdatedUser {
  updatedUser: IUser;
}

// Changelogs
export interface FetchedChangelogs {
  changelogs: IChangelog[];
}

export interface FetchedChangelog {
  changelog: IChangelog;
}

// Emojis
export interface FetchedEmojiGroup {
  emojisByGroup: EmojiData[];
}
