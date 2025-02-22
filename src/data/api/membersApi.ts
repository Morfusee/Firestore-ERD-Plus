import { IProjectMembers } from "../../types/ProjectTypes";
import {
  APIResponse,
  FetchedProjectMembers,
  CreatedProjectMember,
  UpdatedProjectMember,
  DeletedProjectMember,
} from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const getProjectMembersApi = async (projectId: string) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedProjectMembers>>(`/projects/${projectId}/members`)
    .then((res) => res.data);

  return response;
};

export const addProjectMemberApi = async (
  projectId: string,
  email: string,
  role: string
) => {
  const response = await axiosInstance
    .post<APIResponse<CreatedProjectMember>>(`/projects/${projectId}/members`, {
      email,
      role,
    })
    .then((res) => res.data);

  return response;
};

export const updateProjectMemberApi = async (
  projectId: string,
  memberId: string,
  updates: Partial<IProjectMembers>
) => {
  const response = await axiosInstance
    .patch<APIResponse<UpdatedProjectMember>>(
      `/projects/${projectId}/members/${memberId}`,
      updates
    )
    .then((res) => res.data);

  return response;
};

export const updateProjectMemberRoleApi = async (
  projectId: string,
  memberId: string,
  role: string
) => {
  const response = await axiosInstance
    .patch<APIResponse<UpdatedProjectMember>>(
      `/projects/${projectId}/members/${memberId}/role`,
      {
        role,
      }
    )
    .then((res) => res.data);

  return response;
};

export const removeProjectMemberApi = async (
  projectId: string,
  memberId: string
) => {
  const response = await axiosInstance
    .delete<APIResponse<DeletedProjectMember>>(
      `/projects/${projectId}/members/${memberId}`
    )
    .then((res) => res.data);

  return response;
};

// Optional: Hook for fetching members (similar to getProjectsHook)
export const getProjectMembersHook = (projectId: string) => {
  const { data, loading, error, refetch, abort } = useFetch<
    IProjectMembers & { _id: string }[]
  >(import.meta.env.VITE_SERVER_URL + `/projects/${projectId}/members`);

  const transformedData = data?.map(({ _id, ...member }) => {
    return {
      ...member,
      id: _id,
    };
  }) as IProjectMembers[];

  return { data: transformedData, loading, error, refetch, abort };
};