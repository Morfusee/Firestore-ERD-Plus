import { IChangelog, useChangelogStore } from "../../store/useChangelogStore";
import { getChangelogByIdApi, getChangelogsApi } from "../api/changelogsApi"




const useChangelogRepo = () => {

  const changelogs = useChangelogStore((state) => state.changelogs);
  const activeChangelog = useChangelogStore((state) => state.selectedChangelog);
  const setChangelogs = useChangelogStore((state) => state.setChangelogs);
  const setSelectedChangelogs = useChangelogStore((state) => state.setSelectedChangelog);
  const addRecentChangelog = useChangelogStore((state) => state.addRecentChangelog);

  const loadChangelogs = async (projectId: string | undefined) => {

    if (!projectId) return

    const res = await getChangelogsApi(projectId)

    const changelogs = res.data.changelogs

    setChangelogs(changelogs)
    setSelectedChangelogs(changelogs[0])
  }

  const saveChangelog = (changelog: IChangelog) => {
    addRecentChangelog(changelog)
    setSelectedChangelogs(changelogs[0])
  }

  const selectChangelog = async (projectId: string, changelog: IChangelog) => {

    const response = await getChangelogByIdApi(projectId, changelog.id!)

    setSelectedChangelogs(changelog)

    return response
  }

  return {
    changelogs,
    activeChangelog,
    loadChangelogs,
    saveChangelog,
    selectChangelog,
  }
}


export default useChangelogRepo