import { MantineThemeOverride } from "@mantine/core";
import { create, StateCreator } from "zustand";
import { EmojiData, EmojiGroup } from "../types/EmojiData";
import { BackgroundVariant } from "@xyflow/react";
import { persist } from "zustand/middleware";

interface IThemeSlice {
  theme: MantineThemeOverride;
  setTheme: (theme: MantineThemeOverride) => void;
}

interface IPartialUserSettingsState {
  autoSaveInterval: number;
  canvasBackground: BackgroundVariant;
}

interface IPartialUserSettingsActions {
  setAutoSaveInterval: (interval: number) => void;
  setCanvasBackground: (background: BackgroundVariant) => void;
}

interface IEmojiState extends EmojiGroup {
  emojis: EmojiData[];
}

interface IEmojiActions {
  setEmojis: (emojis: EmojiData[]) => void;
  resetEmojis: () => void;
}

export const usePartialUserSettingsStore = create<
  IPartialUserSettingsState & IPartialUserSettingsActions
>()(
  persist(
    (set) => ({
      autoSaveInterval: 0,
      canvasBackground: BackgroundVariant.Dots,

      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),
      setCanvasBackground: (background) =>
        set({ canvasBackground: background }),
    }),
    {
      name: "userSettings",
    }
  )
);

export const useThemeStore = create<IThemeSlice>((set) => ({
  theme: {},
  setTheme: (theme) => set({ theme }),
}));

export const useEmojiStore = create<IEmojiState & IEmojiActions>((set) => ({
  emojis: [],
  smileysEmotion: [],
  peopleBody: [],
  animalsNature: [],
  foodDrink: [],
  travelPlaces: [],
  activities: [],
  objects: [],
  symbols: [],
  component: [],

  setEmojis: (emojis) => {
    set({ emojis });
    filterEmojiList(emojis, set);
  },
  resetEmojis: () =>
    set(() => ({
      emojis: [],
      smileysEmotion: [],
      peopleBody: [],
      animalsNature: [],
      foodDrink: [],
      travelPlaces: [],
      activities: [],
      objects: [],
      symbols: [],
      component: [],
    })),
}));

const filterEmojiList = (
  data: EmojiData[],
  setter: (fn: (state: IEmojiState) => IEmojiState) => void
) => {
  for (const emoji of data) {
    const toCamelCase = (str: string) =>
      str.replace(/-([a-z])/g, (_, char) => char.toUpperCase());

    const emojiGroup = toCamelCase(emoji.group) as keyof EmojiGroup;

    setter((prev) => ({
      ...prev,
      [emojiGroup]: [...prev[emojiGroup], emoji],
    }));
  }
};
