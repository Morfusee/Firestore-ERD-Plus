import mongoose from "mongoose";

export interface IProject {
  name: string;
  icon: string;
  data?: string;
  members?: {
    userId: mongoose.Types.ObjectId;
    role: "owner" | "admin" | "editor" | "viewer";
  };
  createdAt?: Date;
  updatedAt?: Date;
  _id: mongoose.Types.ObjectId;
  __v: number;
}
