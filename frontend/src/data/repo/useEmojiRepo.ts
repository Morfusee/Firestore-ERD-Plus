import { useEmojiStore } from "../../store/globalStore";
import { EmojiAsyncGroup, EmojiData } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";
import { emojiGroupApi } from "../api/emojiApi";
import { db } from "../db/db";

const useEmojiRepo = () => {
  const emojis = useEmojiStore((state) => state.emojis);

  const setState = useEmojiStore((state) => state.setEmojis);
  const resetState = useEmojiStore((state) => state.resetEmojis);

  const getEmojisList = () => {
    return emojis;
  };

  const getEmojiByHex = async (hex: string) => {
    return await db.emojis.where("hexcode").equals(hex).first();
  };

  const getHexByEmoji = async (emoji: string) => {
    const emojiData = await db.emojis.where("emoji").equals(emoji).first();
    return emojiData?.hexcode;
  };

  const setEmojis = async (emojis: EmojiData[]) => {
    const timestamp = Date.now();
    const data: EmojiData[] = emojis.map((emoji) => ({
      ...emoji,
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const id = await db.emojis.bulkAdd(data);

    setState(data);
  };

  const resetEmojis = async () => {
    await db.emojis.clear();
    resetState();
  };

  const getEmojiGroup = async (
    group: keyof EmojiAsyncGroup,
    props: {
      setEmojiData: (data: EmojiData[]) => void;
      setLoading: (loading: boolean) => void;
      setError: (error: string | null) => void;
    }
  ) => {
    try {
      // Always set loading to true before fetching data
      props.setLoading(true);

      // Fetch data from the server
      const getEmojiGroupResponse = await emojiGroupApi(group);

      // Set the emoji data to return
      props.setEmojiData(getEmojiGroupResponse.data.emojisByGroup);

      // Reset the error state
      props.setError(null);
    } catch (err) {
      // Set the error state
      props.setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      // Always set loading to false after fetching data
      props.setLoading(false);
    }
  };

  return {
    getEmojisList,
    getEmojiByHex,
    getHexByEmoji,
    setEmojis,
    resetEmojis,
    getEmojiGroup,
  };
};

export default useEmojiRepo;
