import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface IMember {
  id?: string
  username: string
  email: string
  displayName: string
  role: string
}

export interface IChangelog {
  id?: string
  name: string
  project: string
  data: string
  currentVersion: boolean
  members?: IMember[]
  createdAt: string
}

interface IChangelogState {
  changelogs: IChangelog[]
  selectedChangelog: IChangelog | null
}

interface IChangelogActions {
  setChangelogs: (changelogs: IChangelog[]) => void;
  setSelectedChangelog: (changelog: IChangelog) => void;
  addRecentChangelog: (changelog: IChangelog) => void
}


export const useChangelogStore = create<IChangelogState & IChangelogActions>()(
  devtools(
    (set) => ({
      changelogs: [],
      selectedChangelog: null,

      setChangelogs: (changelogs) => set(() => ({ changelogs: changelogs })),
      setSelectedChangelog: (changelog) => set(() => ({ selectedChangelog: changelog })),
      addRecentChangelog: (changelog) => set((state) => ({ 
        changelogs: [changelog, ...state.changelogs]
      }))
    }),
    {
      name: "changelogStore",
    }
  )
);
