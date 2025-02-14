import { useFetch } from "@mantine/hooks";
import { IProject } from "../../types/ProjectTypes";
import {
  APIResponse,
  CreatedProject,
  DeletedProject,
  FetchedProject,
  FetchedProjects,
  SavedProject,
  UpdatedProject,
} from "../../types/APITypes";
import axiosInstance from "../../utils/axiosInstance";

export const createProjectApi = async (
  name: IProject["name"],
  icon: IProject["icon"],
  userId: string
) => {
  const response = await axiosInstance
    .post<APIResponse<CreatedProject>>("/projects", {
      name: name,
      icon: icon,
      userId: userId,
    })
    .then((res) => res.data);

  return response;
};

export const getProjectsApi = async (userId: string) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedProjects>>(`/projects?userId=${userId}`)
    .then((res) => res.data);

  return response;
};

export const getProjectByIdApi = async (projectId: string) => {
  const response = await axiosInstance
    .get<APIResponse<FetchedProject>>(`/projects/${projectId}`)
    .then((res) => res.data);

  return response;
};

export const editProjectApi = async (
  name: IProject["name"],
  icon: IProject["icon"],
  projectId: IProject["id"]
) => {
  const response = await axiosInstance
    .patch<APIResponse<UpdatedProject>>(`/projects/${projectId}`, {
      name: name,
      icon: icon,
    })
    .then((res) => res.data);

  return response;
};

export const saveProjectApi = async (
  projectId: IProject["id"],
  data: string,
  members: string[]
) => {
  const response = await axiosInstance
    .patch<APIResponse<SavedProject>>(`/projects/${projectId}/data`, {
      data: data,
      members: members,
    })
    .then((res) => res.data);

  return response;
};

export const deleteProjectApi = async (projectId: string) => {
  const response = await axiosInstance
    .delete<APIResponse<SavedProject>>(`/projects/${projectId}`)
    .then((res) => res.data);

  return response;
};

// NOTE: Unmaintained
export const getProjectsHook = (userId: string) => {
  const { data, loading, error, refetch, abort } = useFetch<
    IProject & { _id: string }[]
  >(import.meta.env.VITE_SERVER_URL + `/projects?userId=${userId}`);

  const transformedData = data?.map(({ _id, ...project }) => {
    return {
      ...project,
      id: _id,
    };
  }) as IProject[];

  return { data: transformedData, loading, error, refetch, abort };
};
