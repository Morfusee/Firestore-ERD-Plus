import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { IProject } from "../../types/ProjectTypes";
import { useEditorStore } from "../../store/useEditorStore";
import { IEditorDataSnapshot } from "../../types/EditorStoreTypes";

const useProjectRepo = () => {
  const projects = useProjectStore((state) => state.projects);
  const selectedProject = useProjectStore((state) => state.selectedProject);
  const setSelectedProject = useProjectStore(
    (state) => state.setSelectedProject
  );

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

  const getProjectById = (id: number) => {
    return projects.find((project) => project.id === id);
  };

  const saveProjectCache = (id: number) => {
    const stateSnap = getStateSnap();
    saveCache({
      id: id,
      stateData: stateSnap,
    });
  };

  const loadProject = (project: IProject) => {
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

  const selectProject = (id: number | undefined) => {
    const selected = projects.find((project) => project.id === id);
    if (!selected) return;

    if (selectedProject && selectedProject.id === id) return;

    if (selectedProject && selectedProject.id !== undefined) {
      saveProjectCache(selectedProject.id);
    }

    const cache = getCache().find(item => item.id === id)
    if (cache) {
      loadCache(cache.stateData)
    } else {
      loadProject(selected)
    }

    setSelectedProject(selected);
  };

  const addProject = async (name: string, icon: string) => {
    const timestamp = Date.now();
    const data: IProject = {
      name: name,
      icon: icon,
      diagramData: JSON.stringify({
        nodes: [],
        edges: [],
      }),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Save to db
    const id = await db.projects.add(data);

    // Save to state
    addState({
      ...data,
      id: id,
    });
  };

  const editProject = async (id: number, name: string, icon: string) => {
    const edit = projects.find((project) => project.id === id);

    if (!edit) {
      console.warn(
        `Error editing the project - project with the id ${id} cannot be found`
      );
      return;
    }
    if (name == "") {
      console.warn(`Error editing the project - name should not be blank`);
      return;
    }
    if (icon == "") {
      console.warn(`Error editing the project - invalid icon`);
      return;
    }

    const timestamp = Date.now();
    const data = {
      name: name,
      icon: icon,
      updatedAt: timestamp,
    };

    // Save to db
    await db.projects.update(id, data);

    // Save to state
    editState(id, data);
  };

  const deleteProject = async (id: number) => {
    // TODO: Deselect current project if deleted
    const project = projects.find((project) => project.id === id);

    if (!project) {
      console.warn(
        `Error deleting the project - project with the id ${id} cannot be found`
      );
      return;
    }

    // Delete from db
    await db.projects.delete(id);

    // Delete from state
    deleteState(id);
  };

  const duplicateProject = async (id: number) => {
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
    getProjectById,
    selectedProject,
    selectProject,
    addProject,
    editProject,
    deleteProject,
    duplicateProject,
  };
};

export default useProjectRepo;
