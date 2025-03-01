import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BackgroundVariant } from "@xyflow/react";

export interface IUserSettings {
  autoSaveInterval: number;
  canvasBackground: BackgroundVariant;
  theme: "Light" | "Dark";
}

interface ISettingsState {
  settings: IUserSettings | null;
}

interface ISettingsActions {
  setSettings: (settings: IUserSettings) => void;
  getSettings: () => IUserSettings | null;
  updateSettings: <K extends keyof IUserSettings>(
    key: K,
    value: IUserSettings[K]
  ) => void;
}

export const useSettingsStore = create<ISettingsState & ISettingsActions>()(
  devtools(
    (set, get) => ({
      settings: null,

      setSettings: (settings) => set({ settings }),
      getSettings: () => get().settings,

      updateSettings: (key, value) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, [key]: value } : null,
        })),
    }),
    { name: "settingsStore" }
  )
);
