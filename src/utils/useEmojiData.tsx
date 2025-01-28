import { useState, useEffect } from "react";
import { EmojiAsyncGroup, EmojiData } from "../types/EmojiData";
import { usePrevious } from "@mantine/hooks";

const useEmojiData = (group: keyof EmojiAsyncGroup) => {
  // Define the state variables
  const [emojiData, setEmojiData] = useState<EmojiData[]>([]);

  // Define the loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the emoji data when the group changes
  useEffect(() => {
    fetchEmojiGroup(group);
  }, [group]);

  const fetchEmojiGroup = async (group: keyof EmojiAsyncGroup) => {
    try {
      // Always set loading to true before fetching data
      setLoading(true);

      // Fetch data from the server
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + `/emojis?group=${group}`
      );

      // Throw an error if the response is not ok
      if (!response.ok) {
        throw new Error("There was an error fetching emojis.");
      }

      const data: EmojiData[] = await response.json();

      // Set the emoji data to return
      setEmojiData(data);

      // Reset the error state
      setError(null);
    } catch (err) {
      // Set the error state
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      // Always set loading to false after fetching data
      setLoading(false);
    }
  };

  return { emojiData, loading, error, fetchEmojiGroup };
};

export default useEmojiData;
