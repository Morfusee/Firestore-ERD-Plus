import { create } from "zustand";
import { IProject, IProjectAccess, MemberRole } from "../types/ProjectTypes";
import { IEditorStateSnapshot } from "../types/EditorStoreTypes";
import { devtools } from "zustand/middleware";

interface IProjectCache {
  id: string;
  stateData: IEditorStateSnapshot;
}

interface IProjectState {
  projects: IProject[];
  selectedProject: IProject | null;
  selectedProjectRole: MemberRole | null
  projectStateCache: IProjectCache[];
}

interface IProjectActions {
  setProjects: (projects: IProject[]) => void;
  getProjects: () => IProject[];
  setSelectedProject: (project: IProject) => void;
  setSelectedProjectRole: (role: MemberRole) => void;
  clearSelectedProject: () => void;
  clearSelectedProjectRole: () => void;
  addProject: (project: IProject) => void;
  editProject: (id: string, change: Partial<IProject>) => void;
  editSelectedProjectAccess: (access: IProjectAccess) => void;
  deleteProject: (id: string) => void;
  saveCache: (cache: IProjectCache) => void;
  getCache: () => IProjectCache[];
  
}

export const useProjectStore = create<IProjectState & IProjectActions>()(
  devtools(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      selectedProjectRole: null,
      projectStateCache: [],

      setProjects: (projects) => set(() => ({ projects: projects })),
      getProjects: () => {
        return get().projects;
      },
      setSelectedProject: (project) =>
        set(() => ({ selectedProject: project })),
      clearSelectedProject: () => set(() => ({ selectedProject: null })),
      setSelectedProjectRole: (role) =>
        set(() => ({ selectedProjectRole: role })),
      clearSelectedProjectRole: () => set(() => ({ selectedProjectRole: null })),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),
      editProject: (id, change) =>
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id == id) {
              return {
                ...project,
                ...change,
              };
            } else {
              return project;
            }
          }),
        })),
      editSelectedProjectAccess: (access) =>
        set((state) => {
          if (state.selectedProject) {
            return {
              selectedProject: {
                ...state.selectedProject,
                generalAccess: access
              }
            }
          } else {
            return {
              selectedProject: null
            }
          }
        }),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),

      saveCache: (stateData) =>
        set((state) => {
          const isCached = state.projectStateCache.some(
            (projectCache) => projectCache.id === stateData.id
          );
          if (isCached) {
            return {
              projectStateCache: state.projectStateCache.map((projectCache) => {
                if (projectCache.id == stateData.id) {
                  return {
                    ...projectCache,
                    stateData: stateData.stateData,
                  };
                } else {
                  return projectCache;
                }
              }),
            };
          } else {
            return {
              projectStateCache: [...state.projectStateCache, stateData],
            };
          }
        }),

      getCache: () => {
        const cache = get().projectStateCache;
        return cache;
      },
    }),
    {
      name: "projectStore",
    }
  )
);

