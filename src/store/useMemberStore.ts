import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { IProjectMembers } from "../types/ProjectTypes";

interface IMemberState {
  projectMembers: Record<string, IProjectMembers[]>;
  isLoading: boolean;
  error: string | null;
}

interface IMemberActions {
  setProjectMembers: (projectId: string, members: IProjectMembers[]) => void;
  clearProjectMembers: (projectId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMemberStore = create<IMemberState & IMemberActions>()(
  devtools(
    (set, get) => ({
      projectMembers: {},
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

      setLoading: (loading) => set(() => ({ isLoading: loading })),
      setError: (error) => set(() => ({ error })),
    }),
    {
      name: "memberStore",
    }
  )
);