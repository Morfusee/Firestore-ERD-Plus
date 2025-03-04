import { APIResponse, FetchedEmojiGroup } from "../../types/APITypes";
import { EmojiAsyncGroup, EmojiData } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";

export const emojiGroupApi = async (group: keyof EmojiAsyncGroup) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedEmojiGroup>>(`/emojis?group=${group}`)
    .then((res) => {
      console.log(res);
      if (res.statusText != "OK") {
        throw new Error("There was an error fetching emojis.");
      }
      return res.data;
    });

  return response;
};
