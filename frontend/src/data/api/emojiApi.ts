import { APIResponse, FetchedEmojiGroup } from "../../types/APITypes";
import { EmojiAsyncGroup, EmojiData } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";
import { isSuccessStatus } from "../../utils/successHelpers";

export const emojiGroupApi = async (
  group: keyof EmojiAsyncGroup
): Promise<EmojiData[]> => {
  const emojis: EmojiData[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
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

    emojis.push(...(response.data.items ?? []));

    hasNextPage = response.data.hasNextPage ?? false;
    page += 1;
  }

  return emojis;
};
