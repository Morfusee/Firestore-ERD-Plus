import { APIResponse, FetchedEmojiGroup } from "../../types/APITypes";
import { EmojiAsyncGroup, EmojiData } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";
import { isSuccessStatus } from "../../utils/successHelpers";

export const emojiGroupApi = async (group: keyof EmojiAsyncGroup) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedEmojiGroup>>(`/emojis?group=${group}`)
    .then((res) => {
      if (isSuccessStatus(res.status)) {
        throw new Error("There was an error fetching emojis.");
      }
      return res.data;
    });

  return response;
};
