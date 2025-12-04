import { useEditorStore } from "../../store/useEditorStore";
import { useProjectStore } from "../../store/useProjectStore";

const useDownloadRepo = () => {
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const getDataSnapshot = useEditorStore((state) => state.getDataSnapshot);

  const getProjectDetails = () => {
    const projectDetails = {
      ...selectedProject,
      data: getDataSnapshot(),
    };

    return projectDetails
  };

  return { getProjectDetails };
};

export default useDownloadRepo;
