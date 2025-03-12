export interface IProject {
  id?: string;
  name: string;
  icon: string;
  data?: string;
  members: IProjectMembers[];
  generalAccess: IProjectAccess;
  createdAt: number;
  updatedAt: number;
}

export interface IProjectMembers {
  id: string;
  profilePicture: string;
  username: string;
  displayName: string;
  role: string;
}

export type MemberRole = "Owner" | "Admin" | "Editor" | "Viewer"

export type AccessType = "Restricted" | "Link";

export interface IProjectAccess {
  accessType: AccessType;
  role: string;
}