import { useEffect, useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { useEmojiStore } from "../../store/globalStore";
import useEmojiRepo from "./useEmojiRepo";
import useProjectRepo from "./useProjectRepo";
import { useParams } from "react-router-dom";

export const useDataInitializer = () => {
  const { setProjects } = useProjectStore();
  const params = useParams();
  const id = params.projectId;
  const { selectProject } = useProjectRepo();

  // Emojis
  const { emojis, setEmojis: setEmojisStore } = useEmojiStore();
  const { setEmojis: setEmojisDB } = useEmojiRepo();

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([loadProjects(), loadEmojis()]).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (id) {
      selectProject(Number(id));
    }
  }, [id, isLoaded]);

  const loadProjects = async () => {
    console.log("Loading projects from local storage");
    const projectList = await db.projects.toArray();
    setProjects(projectList);
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
