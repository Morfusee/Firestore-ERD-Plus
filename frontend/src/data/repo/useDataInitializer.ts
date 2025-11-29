import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmojiStore } from "../../store/globalStore";
import { getProjectsApi } from "../api/projectsApi";
import { db } from "../db/db";
import useChangelogRepo from "./useChangelogRepo";
import useEmojiRepo from "./useEmojiRepo";
import useHistoryRepo from "./useHistoryRepo";
import useProjectRepo from "./useProjectRepo";
import { useSettingsRepo } from "./useSettingsRepo";
import useUserRepo from "./useUserRepo";
import CustomNotification from "../../components/ui/CustomNotification";
import { AxiosError } from "axios";

export const useDataInitializer = () => {
  const { user } = useUserRepo();
  const { setProjectList, selectProject } = useProjectRepo();
  const { loadChangelogs } = useChangelogRepo();
  const { fetchUserSettings } = useSettingsRepo();
  const { resetHistory } = useHistoryRepo();
  const navigate = useNavigate();

  // Router
  const params = useParams();
  const id = params.projectId;

  // Emojis
  const { emojis, setEmojis: setEmojisStore } = useEmojiStore();
  const { setEmojis: setEmojisDB } = useEmojiRepo();

  // State
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([loadProjects(), loadEmojis(), loadUserSettings()]).then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const loadSelectedProject = async () => {
      try {
        if (id && user && isLoaded) {
          const res = await selectProject(id);
          resetHistory();
          if (res) {
            loadChangelogs(id);
          }
    
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          CustomNotification({
            status: "error",
            title: "Failed to Load Project",
            message: err.response?.data.message,
          });
        }
        navigate("/", { replace: true })
      }
    }

    loadSelectedProject()
  }, [id, isLoaded]);

  const loadProjects = async () => {
    console.log("Loading projects from local storage");

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
    const emojiDB = await db.emojis.count();

    if (emojiDB > 0) {
      const emojiList = await db.emojis.toArray();
      return setEmojisStore(emojiList);
    }

    console.log("Loading emojis from API");
    return fetchEmojis().then((data) => {
      setEmojisDB(data);
    });
  };

  const loadUserSettings = async () => {
    console.log("Loading user settings from server");
    if (!user) return;
    await fetchUserSettings(user.id);
  };

  return {
    isLoaded,
  };
};
