import { IProjectMembers } from "../../types/ProjectTypes";
import {
  APIResponse,
  FetchedProjectMembers,
  CreatedProjectMember,
  UpdatedProjectMember,
  DeletedProjectMember,
} from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";
import axios from "axios";
import { useFetch } from "@mantine/hooks";

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
): Promise<APIResponse<CreatedProjectMember>> => {
  console.log("addProjectMemberApi: Project ID:", projectId);
  console.log("addProjectMemberApi: Email:", email);
  console.log("addProjectMemberApi: Role:", role);

  try {
    if (!projectId || !email || !role) {
      throw new Error("Invalid input parameters");
    }

    const response = await axiosInstance.post<
      APIResponse<CreatedProjectMember>
    >(`/projects/${projectId}/members`, { email, role });
    console.log("addProjectMemberApi: Response:", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.log(
        "addProjectMemberApi: API error:",
        error.response.status,
        error.response.data
      );
      throw new Error(
        `API error: ${error.response.status} ${error.response.data}`
      );
    } else {
      console.log("addProjectMemberApi: Unexpected error:", error);
    }
    throw new Error("An unexpected error occurred");
  }
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
      `/projects/${projectId}/members/${memberId}`,
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
