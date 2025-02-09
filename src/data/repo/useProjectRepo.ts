import { useProjectStore } from "../../store/useProjectStore";
import { db } from "../db/db";
import { IProject } from "../../types/ProjectTypes";
import { useEditorStore } from "../../store/useEditorStore";
import { IEditorDataSnapshot } from "../../types/EditorStoreTypes";
import { createProjectApi, editProjectApi, deleteProjectApi, getProjectByIdApi } from "../api/projectsApi";


const useProjectRepo  = () => {
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
  const loadDiagramData = useEditorStore((state) => state.loadDataSnapshot);
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
    if (!project.data) {
      loadStateData({
        nodes: [],
        edges: []
      })
      return
    }
    const data = JSON.parse(project.data) as IEditorDataSnapshot;

    // Load the data to the state
    loadStateData(data);
  };

  const loadProjectData = (diagramData: IEditorDataSnapshot) => {
    if (!diagramData) {
      loadDiagramData({
        nodes: [],
        edges: []
      })
      return
    }

    // Load the data to the state
    loadStateData(diagramData);
  };

  const resetProjectCanvas = () => {
    clearRedo();
    clearUndo();
    setCanUndo(false);
    setCanRedo(false);
  };

  const selectProject = async (projectId: string | undefined) => {

    if (!projectId) return

    // Save the previous current project to cache
    if (selectedProject && selectedProject.id !== undefined) {
      saveProjectCache(selectedProject.id);
    }
    
    // Fetch the new selected project
    const res = await getProjectByIdApi(projectId)
    const selected = res.data.project

    const cache = getCache().find((item) => item.id === projectId);
    if (cache) {
      console.log("Loading cache money")
      loadCache(cache.stateData);
    } else {
      console.log("Loading projector")
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

  const addProject = async (
    name: IProject["name"],
    icon: IProject["icon"],
    userId: string
  ) => {
    const response = await createProjectApi(
      name,
      icon,
      userId
    );

    // Add to state
    if (response.success) {
      addState(response.data.createdProject);
    }

    return response
  };

  const editProject = async (
    id: string,
    name: string,
    icon: string,
  ) => {

    if (name == "" && icon == "") {
      console.warn("Incomplete data.");
      return;
    }

    const response = await editProjectApi(name, icon, id);

    // Save to state
    if (response.success) {
      const updatedData = {
        name: response.data.updatedProject.name,
        icon: response.data.updatedProject.icon,
        updatedAt: response.data.updatedProject.updatedAt,
      };

      editState(id, updatedData);
    }

    return response
  };

  const deleteProject = async (projectId: string) => {

    const response = await deleteProjectApi(projectId);

    // Delete from state
    if(response.success) {
      deleteState(projectId);
    }

    return response
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
    loadProjectData,
  };
};

export default useProjectRepo;