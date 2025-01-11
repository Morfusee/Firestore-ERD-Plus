import { useEmojiStore } from "../../store/globalStore";
import { EmojiData } from "../../types/EmojiData";
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

  return {
    getEmojisList,
    getEmojiByHex,
    getHexByEmoji,
    setEmojis,
    resetEmojis,
  };
};

export default useEmojiRepo;
