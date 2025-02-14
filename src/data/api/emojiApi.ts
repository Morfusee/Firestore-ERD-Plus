import { EmojiAsyncGroup, EmojiData } from "../../types/EmojiData";
import axiosInstance from "../../utils/axiosInstance";

export const getEmojiGroup = async (
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
    const response = await axiosInstance(`/emojis?group=${group}`).then(
      (res) => {
        console.log(res);
        // Throw an error if the response is not ok

        if (res.statusText != "OK") {
          throw new Error("There was an error fetching emojis.");
        }

        return res.data;
      }
    );

    // Set the emoji data to return
    props.setEmojiData(response);

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
