import { Request } from "express";
import { Session } from "express-session";


export interface ValidatedRoleRequest extends Request {
  userId?: string
}

export interface AuthRequest<P = {}, B = {}> extends Request<P, {}, B> {
  session: CustomSession;
  user?: any;
}

export interface AuthUser {
  iss: string;
  aud: string;
  auth_time: number;
  user_id: string;
  sub: string;
  iat: number;
  exp: number;
  email: string;
  email_verified: boolean;
  firebase: AuthUserFirebaseField;
  uid: string;
}

export interface AuthUserFirebaseField {
  identities: { email: Array<string> };
  sign_in_provider: string;
}

export interface CustomSession extends Session {
  passport?: {
    user: {
      id: string;
      username?: string;
      email?: string;
      displayName?: string;
      token?: string;
      ownedProjects?: any[];
      sharedProjects?: any[];
      createdAt?: string;
      updatedAt?: string;
    };
  };
}
