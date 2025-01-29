import { useEffect, useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { useEmojiStore } from "../../store/globalStore";
import useEmojiRepo from "./useEmojiRepo";
import useProjectRepo from "./useProjectRepo";
import { useParams } from "react-router-dom";
import { getProjects } from "../api/projectsApi";
import { useIsFirstRender } from "@mantine/hooks";

export const useDataInitializer = () => {
  const { setProjectList, selectProject } = useProjectRepo();

  // Router
  const params = useParams();
  const id = params.projectId;

  // Emojis
  const { emojis, setEmojis: setEmojisStore } = useEmojiStore();
  const { setEmojis: setEmojisDB } = useEmojiRepo();

  // State
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Hook for checking if it's the first render
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    Promise.all([loadProjects(), loadEmojis()]).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (id) {
      selectProject(id);
    }
  }, [id, isLoaded]);

  const loadProjects = async () => {
    console.log("Loading projects from local storage");

    // Dexie fetching of projects
    // NOTE: Not needed anymore
    const projectList = await db.projects.toArray();

    // Backend fetching of projects
    setProjectList(await getProjects("67905ca5411c5dcf426c89c6"));
  };

  const fetchEmojis = async () => {
    const response = await fetch(
      "https://morfusee.github.io/emoji-list-api/emojis.json"
    );
    const data = await response.json();
    return data;
  };

  const loadEmojis = async () => {
    const emojiDB = await db.emojis.count();

    if (emojiDB > 0) {
      const emojiList = await db.emojis.toArray();
      return setEmojisStore(emojiList);
    }

    return fetchEmojis().then((data) => {
      setEmojisDB(data);
    });
  };

  return {
    isLoaded,
  };
};
