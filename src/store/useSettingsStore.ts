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
  updateSettings: <K extends keyof IUserSettings>(
    key: K,
    value: IUserSettings[K]
  ) => void;
}

export const useSettingsStore = create<ISettingsState & ISettingsActions>()(
  devtools(
    (set) => ({
      settings: null,

      setSettings: (settings) => set({ settings }),

      updateSettings: (key, value) =>
        set((state) => ({
          settings: state.settings ? { ...state.settings, [key]: value } : null,
        })),
    }),
    { name: "settingsStore" }
  )
);
