import { useFetch } from "@mantine/hooks";
import { IProject } from "../../types/ProjectTypes";
import { APIResponse, CreatedProject, DeletedProject, FetchedProject, FetchedProjects, SavedProject, UpdatedProject } from "../../types/APITypes";

export const createProjectApi = async (
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

  return response as APIResponse<CreatedProject>;
};

export const getProjectsApi = async (userId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects?userId=${userId}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // // If response is empty, return an empty array
  // if (!response) return [];

  return response as APIResponse<FetchedProjects>;
};


export const getProjectByIdApi = async (projectId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<FetchedProject>
}

export const editProjectApi = async (
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

  return response as APIResponse<UpdatedProject>;
};

export const saveProjectApi = async (
  projectId: IProject["id"],
  data: string,
  members: string[],
) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}/data`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: data,
        members: members
      }),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  return response as APIResponse<SavedProject>;
};

export const deleteProjectApi = async (projectId: string) => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects/${projectId}`,
    {
      method: "DELETE",
    }
  )
    .then((res) => res.json())
    .catch((err) => console.log(err));

  return response as APIResponse<DeletedProject>;
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