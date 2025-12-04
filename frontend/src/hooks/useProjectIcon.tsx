import { useLiveQuery } from "dexie-react-hooks";
import useEmojiRepo from "../data/repo/useEmojiRepo";
import { IProject } from "../types/ProjectTypes";

const useProjectIcon = (
  projectIconHex: string | undefined,
  selectedProject: IProject | null,
  projectId: IProject["id"]
) => {
  const { getEmojiByHex } = useEmojiRepo();

  const fetchIcon = async () => {
    if (!projectIconHex) return undefined;
    const emoji = await getEmojiByHex(projectIconHex);
    return emoji?.emoji;
  };

  const projectIcon = useLiveQuery(fetchIcon, [projectIconHex]);

  const isProjectSelected = selectedProject?.id === projectId;

  return { projectIcon, isProjectSelected };
};

export default useProjectIcon;
