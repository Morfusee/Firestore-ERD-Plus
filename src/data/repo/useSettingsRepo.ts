import { getSettingsApi, updateSettingsApi } from "../api/settingsApi";
import { IUserSettings, useSettingsStore } from "../../store/useSettingsStore";
import { BackgroundVariant } from "@xyflow/react";

export const useSettingsRepo = () => {
  const { settings, setSettings, updateSettings } = useSettingsStore();

  const fetchUserSettings = async (userId: string) => {
    try {
      const response = await getSettingsApi(userId);
      if (response.success) {
        setSettings(response.data.settings);
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
        setSettings(response.data.updatedSettings);
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

  return {
    settings,
    fetchUserSettings,
    updateUserSettings,
    updateSettings,
    getCanvasBackground,
  };
};
