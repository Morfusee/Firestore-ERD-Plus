import { useState, useEffect } from "react";
import { EmojiAsyncGroup, EmojiData } from "../types/EmojiData";
import { usePrevious } from "@mantine/hooks";
import useEmojiRepo from "../data/repo/useEmojiRepo";

const useEmojiData = (group: keyof EmojiAsyncGroup) => {
  // Define the state variables
  const [emojiData, setEmojiData] = useState<EmojiData[]>([]);

  // Define the loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getEmojiGroup } = useEmojiRepo();

  // Fetch the emoji data when the group changes
  useEffect(() => {
    getEmojiGroup(group, {
      setEmojiData,
      setLoading,
      setError,
    });
  }, [group]);

  return { emojiData, loading, error, fetchEmojiGroup: getEmojiGroup };
};

export default useEmojiData;
