import axiosInstance from "../../utils/axiosInstance";
import { APIResponse } from "../../types/APITypes";
import { IUserSettings } from "../../store/useSettingsStore";

export const getSettingsApi = async (userId: string) => {
  const response = await axiosInstance
    .get<APIResponse<{ settings: IUserSettings }>>(`/users/${userId}/settings`)
    .then((res) => res.data);

  return response;
};

export const updateSettingsApi = async (
  userId: string,
  settings: IUserSettings
) => {
  try {
    const response = await axiosInstance
      .patch<APIResponse<{ updatedSettings: IUserSettings }>>(
        `/users/${userId}/settings`,
        settings
      )
      .then((res) => res.data);

    console.log("API Response:", response);

    return response;
  } catch (error) {
    console.error("API Error updating settings:", error);
    throw error;
  }
};
