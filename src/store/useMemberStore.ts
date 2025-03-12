import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IProjectMembers, MemberRole } from "../types/ProjectTypes";

interface IMemberState {
  projectMembers: Record<string, IProjectMembers[]>;
  isLoading: boolean;
  currentProjectAccess: null | "Viewer" | "Editor" | "Admin" | "Owner"
  error: string | null;
}

interface IMemberActions {
  setProjectMembers: (projectId: string, members: IProjectMembers[]) => void;
  clearProjectMembers: (projectId: string) => void;
  setCurrentProjectAccess: (role: null | MemberRole) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<IMemberState & IMemberActions>()(
  devtools(
    (set, get) => ({
      projectMembers: {},
      currentProjectAccess: null,
      isLoading: false,
      error: null,

      setProjectMembers: (projectId, members) =>
        set((state) => ({
          projectMembers: {
            ...state.projectMembers,
            [projectId]: members,
          },
        })),

      clearProjectMembers: (projectId) =>
        set((state) => {
          const { [projectId]: _, ...rest } = state.projectMembers;
          return { projectMembers: rest };
        }),

      setCurrentProjectAccess: (role) =>
        set(() => ({
          currentProjectAccess: role
        })),

      setLoading: (loading) => set(() => ({ isLoading: loading })),
      setError: (error) => set(() => ({ error })),
    }),
    {
      name: "memberStore",
    }
  )
);