import { useEffect, useState } from "react";
import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { useEmojiStore } from "../../store/globalStore";
import useEmojiRepo from "./useEmojiRepo";
import useProjectRepo from "./useProjectRepo";
import { useNavigate, useParams } from "react-router-dom";
import { getProjectsApi } from "../api/projectsApi";
import { useIsFirstRender } from "@mantine/hooks";
import useUserRepo from "./useUserRepo";
import useChangelogRepo from "./useChangelogRepo";

export const useDataInitializer = () => {
  const { user } = useUserRepo();
  const { setProjectList, selectProject } = useProjectRepo();
  const { loadChangelogs } = useChangelogRepo();

  // Router
  const params = useParams();
  const id = params.projectId;

  // Emojis
  const { emojis, setEmojis: setEmojisStore } = useEmojiStore();
  const { setEmojis: setEmojisDB } = useEmojiRepo();

  // State
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([loadProjects(), loadEmojis()]).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (id) {
      selectProject(id);
      loadChangelogs(id);
    }
  }, [id, isLoaded]);

  const loadProjects = async () => {
    console.log("Loading projects from local storage");

    // TODO: Please check the commented lines below, encountered an issue where the user is stuck on the loading state of login page even if the user is logged in
    // Dexie fetching of projects
    // NOTE: Not needed anymore
    // const projectList = await db.projects.toArray();
    if (!user) return;

    const getProjectList = await getProjectsApi(user?.id);

    // Backend fetching of projects
    setProjectList(getProjectList.data.projects);
  };

  const fetchEmojis = async () => {
    const response = await fetch(
      "https://morfusee.github.io/emoji-list-api/emojis.json"
    );
    const data = await response.json();
    return data;
  };

  const loadEmojis = async () => {
    console.log("Loading emojis from local storage");
    // const emojiDB = await db.emojis.count();

    // if (emojiDB > 0) {
    //   const emojiList = await db.emojis.toArray();
    //   return setEmojisStore(emojiList);
    // }

    console.log("Loading emojis from API");
    return fetchEmojis().then((data) => {
      setEmojisDB(data);
    });
  };

  return {
    isLoaded,
  };
};
