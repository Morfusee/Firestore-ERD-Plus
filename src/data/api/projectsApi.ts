import { useFetch } from "@mantine/hooks";
import { IProject } from "../../types/ProjectTypes";

export const createProject = async (
  name: IProject["name"],
  icon: IProject["icon"],
  userId: string
) => {
  const response = await fetch(import.meta.env.VITE_SERVER_URL + "/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      icon: icon,
      userId: userId,
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });

  return response;
};

export const getProjects = async (userId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects?userId=${userId}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // If response is empty, return an empty array
  if (!response) return [];

  // Remove _id and replace it with id by destructuring
  const transformedData = reformatProjectArray(response.data.projects);

  return transformedData;
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

export const editProject = async (
  name: IProject["name"],
  icon: IProject["icon"],
  projectId: IProject["id"]
) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        icon: icon,
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response;
};

export const deleteProject = async (projectId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}`,
    {
      method: "DELETE",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return response;
};

export const reformatProjectArray = (
  projects: IProject & { _id: string }[]
) => {
  return projects.map(({ _id, ...project }) => {
    return {
      ...project,
      id: _id,
    };
  }) as IProject[];
};

export const reformatProject = (project: IProject & { _id: string }) => {
  const { _id, ...desProject } = project;
  return {
    ...desProject,
    id: _id,
  };
};
