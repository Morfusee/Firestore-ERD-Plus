import { Request } from "express";

export interface AuthRequest extends Request {
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
