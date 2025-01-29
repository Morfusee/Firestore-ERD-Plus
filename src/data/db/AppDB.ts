import Dexie, { EntityTable } from "dexie";
import Project from "./Project";
import Emoji from "./Emoji";

export default class AppDB extends Dexie {
  projects!: EntityTable<Project, "id">;
  emojis!: EntityTable<Emoji, "hexcode">;

  constructor() {
    super("FirestoreERDDB");
    this.version(1).stores({
      projects: "@id",
      emojis: "hexcode, emoji, group",
    });
    this.projects.mapToClass(Project);
    this.emojis.mapToClass(Emoji);
  }
}
