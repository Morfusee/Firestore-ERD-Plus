export type EmojiData = {
  emoji: string;
  hexcode: string;
  group: string;
  subgroup: string;
  annotation: string;
  tags: string[];
  shortcodes: string[];
  emoticons: string[];
  directional: boolean;
  variation: boolean;
  variationBase: string | null;
  unicode: number;
  order: number;
  skintone: string | null;
  skintoneCombination: string | null;
  skintoneBase: string | null;
};

export type EmojiGroup = {
  smileysEmotion: EmojiData[];
  peopleBody: EmojiData[];
  animalsNature: EmojiData[];
  foodDrink: EmojiData[];
  travelPlaces: EmojiData[];
  activities: EmojiData[];
  objects: EmojiData[];
  symbols: EmojiData[];
  component: EmojiData[];
};

export type EmojiCategory = {
  faces: EmojiData[];
  nature: EmojiData[];
  activities: EmojiData[];
  places: EmojiData[];
  objects: EmojiData[];
};

export type EmojiAsyncGroup = {
  "smileys-emotion": EmojiData[];
  "people-body": EmojiData[];
  "component": EmojiData[];
  "animals-nature": EmojiData[];
  "food-drink": EmojiData[];
  "travel-places": EmojiData[];
  "objects": EmojiData[];
  "symbols": EmojiData[];
  "activities": EmojiData[];
}
