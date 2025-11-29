import { MantineColorScheme, useMantineColorScheme } from "@mantine/core";
import { BackgroundVariant } from "@xyflow/react";
import { IUserSettings, useSettingsStore } from "../../store/useSettingsStore";
import { getSettingsApi, updateSettingsApi } from "../api/settingsApi";

export const useSettingsRepo = () => {
  const {
    settings,
    setSettings,
    getSettings,
    updateSettings: updateSettingsStore,
  } = useSettingsStore();
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const fetchUserSettings = async (userId: string) => {
    try {
      const response = await getSettingsApi(userId);
      if (response.success) {
        // Set settings in store
        setSettings(response.data.settings);

        // Set the color scheme as it's also a setting
        // We are also triggering the useTheme hook this way
        setColorScheme(
          response.data.settings.theme.toLowerCase() as MantineColorScheme
        );

        return response.data.settings;
      } else {
        console.error("Failed to fetch settings:", response.message);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateUserSettings = async (
    userId: string,
    updatedSettings: IUserSettings
  ) => {
    try {
      if (!settings) return;

      const response = await updateSettingsApi(userId, updatedSettings);
      if (response.success) {
        // Set settings in store
        setSettings(response.data.updatedSettings);

        // Set the color scheme as it's also a setting
        // We are also triggering the useTheme hook this way
        setColorScheme(
          response.data.updatedSettings.theme.toLowerCase() as MantineColorScheme
        );
      } else {
        console.error("Failed to update settings:", response.message);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const getCanvasBackground = () => {
    const canvasBg = settings?.canvasBackground || "Dots";

    return (
      BackgroundVariant[canvasBg as keyof typeof BackgroundVariant] ||
      BackgroundVariant.Dots
    );
  };

  const updateSettings = <K extends keyof IUserSettings>(
    key: K,
    value: IUserSettings[K]
  ) => {
    updateSettingsStore(key, value);
  };

  return {
    settings,
    getSettings,
    fetchUserSettings,
    updateUserSettings,
    updateSettings,
    getCanvasBackground,
  };
};
