import { Schema } from "mongoose";

// Types
type MemberRole = "owner" | "admin" | "editor" | "viewer";

type AccessRole = "viewer" | "editor"

// Model
export interface MemberModel {
  projectId: Schema.Types.ObjectId;
  members: MemberUser[];
}

export interface MemberUser {
  userId: Schema.Types.ObjectId;
  role: MemberRole;
}

// Params and Request
export interface ProjectParams {
  projectId: string;
}

export interface MemberParams extends ProjectParams {
  userId: string;
}

export interface MemberBody {
  userId: string;
  role?: MemberRole;
  username: string;
}

export interface MemberRoleBody {
  role: MemberRole;
}

export interface GeneralAccessBody {
  accessType: string;
  role: AccessRole;
}

// Response
export interface MembersResponse {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: MemberRole;
}

export interface GeneralAccessResponse {
  accessType: string;
  role: AccessRole;
}
