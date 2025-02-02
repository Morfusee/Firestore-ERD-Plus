import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { IProject } from "../../types/ProjectTypes";
import { useEditorStore } from "../../store/useEditorStore";
import { IEditorDataSnapshot } from "../../types/EditorStoreTypes";

const useProjectRepo = () => {
  const projects = useProjectStore((state) => state.projects);
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const setProjects = useProjectStore((state) => state.setProjects);
  const getProjects = useProjectStore((state) => state.getProjects);
  const setSelectedProject = useProjectStore(
    (state) => state.setSelectedProject
  );
  const clearSelectedProject = useProjectStore(
    (state) => state.clearSelectedProject
  );
  const clearStateSnap = useEditorStore((state) => state.clearStateSnapshot);

  const addState = useProjectStore((state) => state.addProject);
  const editState = useProjectStore((state) => state.editProject);
  const deleteState = useProjectStore((state) => state.deleteProject);

  const getStateSnap = useEditorStore((state) => state.getStateSnapshot);
  const saveCache = useProjectStore((state) => state.saveCache);
  const getCache = useProjectStore((state) => state.getCache);
  const loadStateData = useEditorStore((state) => state.loadDataSnapshot);
  const loadCache = useEditorStore((state) => state.loadDataSnapshot);

  const clearRedo = useEditorStore((state) => state.clearRedo);
  const clearUndo = useEditorStore((state) => state.clearUndo);
  const setCanUndo = useEditorStore((state) => state.setCanUndo);
  const setCanRedo = useEditorStore((state) => state.setCanRedo);

  const getProjectsList = () => {
    return projects;
  };

  const setProjectList = (projects: IProject[]) => {
    setProjects(projects);
  };

  const getProjectById = (id: string) => {
    return projects.find((project) => project.id === id);
  };

  const saveProjectCache = (id: string) => {
    const stateSnap = getStateSnap();
    saveCache({
      id: id,
      stateData: stateSnap,
    });
  };

  const loadProject = (project: IProject) => {
    if (!project.diagramData) return;
    const data = JSON.parse(project.diagramData) as IEditorDataSnapshot;
    console.log(data);

    // Load the data to the state
    loadStateData(data);
  };

  const resetProjectCanvas = () => {
    clearRedo();
    clearUndo();
    setCanUndo(false);
    setCanRedo(false);
  };

  const selectProject = (id: string | undefined) => {
    // Non-stale state
    const projects = getProjects();

    // If no projects have been saved, return
    if (!projects) return;
    const selected = projects.find((project) => project.id === id);

    // If no project is selected, return
    if (!selected) return;

    // Save the current project to cache
    if (selectedProject && selectedProject.id !== undefined) {
      saveProjectCache(selectedProject.id);
    }

    const cache = getCache().find((item) => item.id === id);
    if (cache) {
      loadCache(cache.stateData);
    } else {
      loadProject(selected);
    }

    setSelectedProject(selected);
  };

  const clearProject = () => {
    // Set selected project to none
    clearSelectedProject();
    clearStateSnap();

    // Delete cleared project from cache
  };

  const addProject = async (project: IProject) => {
    // const timestamp = Date.now();
    // const data: IProject = {
    //   name: name,
    //   icon: icon,
    //   diagramData: JSON.stringify({
    //     nodes: [],
    //     edges: [],
    //   }),
    //   members: [],
    //   createdAt: timestamp,
    //   updatedAt: timestamp,
    // };

    // // Save to db
    // const id = await db.projects.add(data);

    // // Save to state
    // addState({
    //   ...data,
    //   id: id,
    // });

    // Add to state
    addState(project);
  };

  const editProject = async (
    id: string,
    name: string,
    icon: string,
    updatedAt: IProject["updatedAt"]
  ) => {
    const projects = getProjects();

    const edit = projects.find((project) => project.id === id);

    if (name == "" && icon == "") {
      console.warn("Incomplete data.");
      return;
    }
    // if (!edit) {
    //   console.warn(
    //     `Error editing the project - project with the id ${id} cannot be found`
    //   );
    //   return;
    // }
    // if (name == "") {
    //   console.warn(`Error editing the project - name should not be blank`);
    //   return;
    // }
    // if (icon == "") {
    //   console.warn(`Error editing the project - invalid icon`);
    //   return;
    // }

    // const timestamp = Date.now();

    // // Save to db
    // await db.projects.update(id, data);

    const updatedData = {
      name: name,
      icon: icon,
      updatedAt: updatedAt,
    };

    // Save to state
    editState(id, updatedData);
  };

  const deleteProject = async (id: string) => {
    // // TODO: Deselect current project if deleted
    // const project = projects.find((project) => project.id === id);

    // if (!project) {
    //   console.warn(
    //     `Error deleting the project - project with the id ${id} cannot be found`
    //   );
    //   return;
    // }

    // // Delete from db
    // await db.projects.delete(id);

    // Delete from state
    deleteState(id);
  };

  const duplicateProject = async (id: string) => {
    const project = getProjectById(id);

    if (!project) {
      return console.warn(
        `Error duplicating the project - project with the id ${id} cannot be found`
      );
    }

    const timestamp = Date.now();
    const duplicatedProject = {
      ...project,
      id: undefined,
      name: project.name + " (copy)",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to db
    const newId = await db.projects.add(duplicatedProject);

    // Save to state
    addState({
      ...duplicatedProject,
      id: newId,
    });
  };

  return {
    projects,
    getProjectsList,
    setProjectList,
    getProjectById,
    selectedProject,
    selectProject,
    clearProject,
    addProject,
    editProject,
    deleteProject,
    duplicateProject,
  };
};

export default useProjectRepo;
