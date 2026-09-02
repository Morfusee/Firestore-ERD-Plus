import { APIResponse, FetchedEmojiGroup } from "../../types/APITypes";
import { EmojiAsyncGroup } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";
import { isSuccessStatus } from "../../utils/successHelpers";

export const emojiGroupApi = async (
  group: keyof EmojiAsyncGroup,
  page = 1
): Promise<FetchedEmojiGroup> => {
  const response = await axiosInstance
    .get<APIResponse<FetchedEmojiGroup>>(
      `/emojis?group=${group}&page=${page}&limit=50`
    )
    .then((res) => {
      if (!isSuccessStatus(res.status)) {
        throw new Error("There was an error fetching emojis.");
      }
      return res.data;
    });

  return response.data;
};
