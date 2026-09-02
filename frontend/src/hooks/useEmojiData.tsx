import { useState, useEffect, useRef, useCallback } from "react";
import { EmojiAsyncGroup, EmojiData } from "../types/EmojiData";
import useEmojiRepo from "../data/repo/useEmojiRepo";

const useEmojiData = (group: keyof EmojiAsyncGroup) => {
  // Define the state variables
  const [emojiData, setEmojiData] = useState<EmojiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const pageRef = useRef(1);

  const { getEmojiGroup } = useEmojiRepo();

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      setLoading(true);
      try {
        const response = await getEmojiGroup(group, page);

        pageRef.current = page;
        setEmojiData((previous) => (append ? [...previous, ...response.items] : response.items));
        setHasNextPage(response.hasNextPage ?? false);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
      }
    },
    [group, getEmojiGroup]
  );

  // Fetch the first page when the group changes
  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage]);

  const fetchNextPage = useCallback(() => {
    if (loading || !hasNextPage) {
      return;
    }

    fetchPage(pageRef.current + 1, true);
  }, [loading, hasNextPage, fetchPage]);

  return { emojiData, loading, error, hasNextPage, fetchNextPage };
};

export default useEmojiData;
