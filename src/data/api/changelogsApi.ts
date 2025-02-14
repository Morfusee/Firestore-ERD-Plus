import {
  APIResponse,
  FetchedChangelog,
  FetchedChangelogs,
  FetchedUser,
} from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const getChangelogsApi = async (projectId: string) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedChangelogs>>(`/projects/${projectId}/changelogs`)
    .then((res) => res.data)
    .catch((err) => console.error(err));

  return response;
};

export const getChangelogByIdApi = async (
  projectId: string,
  changelogId: string
) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedChangelog>>(
      `/projects/${projectId}/changelogs/${changelogId}`
    )
    .then((res) => res.data)
    .catch((err) => console.error(err));

  return response;
};
