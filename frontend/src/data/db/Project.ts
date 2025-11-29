import { Entity } from "dexie";
import AppDB from "./AppDB";

export default class Project extends Entity<AppDB> {
  id!: string;
  name!: string;
  icon!: string;
  diagramData?: string;
  members!: { userId: string; role: string }[];
  createdAt!: number;
  updatedAt!: number;
}
