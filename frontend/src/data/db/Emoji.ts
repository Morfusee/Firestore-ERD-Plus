import { Entity } from "dexie";
import AppDB from "./AppDB";

export default class Emoji extends Entity<AppDB> {
  emoji!: string;
  hexcode!: string;
  group!: string;
  subgroup!: string;
  annotation!: string;
  tags!: string[];
  shortcodes!: string[];
  emoticons!: string[];
  directional!: boolean;
  variation!: boolean;
  variationBase!: string | null;
  unicode!: number;
  order!: number;
  skintone!: string | null;
  skintoneCombination!: string | null;
  skintoneBase!: string | null;
}
