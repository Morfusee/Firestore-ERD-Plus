import { APIResponse, FetchedChangelog, FetchedChangelogs, FetchedUser } from "../../types/APITypes";


export const getChangelogsApi = async (projectId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}/changelogs`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<FetchedChangelogs>;
};


export const getChangelogByIdApi = async (projectId: string, changelogId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}/changelogs/${changelogId}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<FetchedChangelog>;
};