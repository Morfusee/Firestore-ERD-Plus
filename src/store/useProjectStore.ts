import { create } from "zustand";
import { IProject } from "../types/ProjectTypes";
import { IEditorStateSnapshot } from "../types/EditorStoreTypes";
import { devtools } from 'zustand/middleware'

interface IProjectCache {
  id: number
  stateData: IEditorStateSnapshot
}

interface IProjectState {
  projects: IProject[]
  selectedProject: IProject | null
  projectStateCache: IProjectCache[]
}

interface IProjectActions {
  setProjects: (projects: IProject[]) => void
  setSelectedProject: (project: IProject) => void
  addProject: (project: IProject) => void
  editProject: (id: number, change: Partial<IProject>) => void
  deleteProject: (id: number) => void
  saveCache: (cache: IProjectCache) => void
  getCache: () => IProjectCache[]
}

export const useProjectStore = create<IProjectState & IProjectActions>()(
  devtools(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      projectStateCache: [],

      setProjects: (projects) => set(() => ({ projects: projects })),
      setSelectedProject: (project) => set(() => ({ selectedProject: project })),

      addProject: (project) => set(state => ({
        projects: [
          ...state.projects,
          project,
        ]
      })),
      editProject: (id, change) => set(state => ({
        projects: state.projects.map(project => {
          if(project.id == id) {
            return {
              ...project,
              ...change
            }
          } else {
            return project
          }
        })
      })),
      deleteProject: (id) => set(state => ({
        projects: state.projects.filter(project => project.id !== id)
      })),

      saveCache: (stateData) => set(state => {
        const isCached = state.projectStateCache.some(projectCache => projectCache.id == stateData.id)
        if (isCached) {
          return {
            projectStateCache: state.projectStateCache.map(projectCache => {
              if(projectCache.id == stateData.id) {
                return {
                  ...projectCache,
                  stateData: stateData.stateData
                }
              } else {
                return projectCache
              }
            })
          }
        } else {
          return {
            projectStateCache: [...state.projectStateCache, stateData]
          }
        }
      }),

      getCache: () => {
        const cache = get().projectStateCache
        return cache
      }

    }),
    {
      name: "projectStore",
    }
  )
)