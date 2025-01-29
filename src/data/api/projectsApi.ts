import { useFetch } from "@mantine/hooks";
import { IProject } from "../../types/ProjectTypes";

export const createProject = async (
  name: IProject["name"],
  icon: IProject["icon"]
) => {
  const response = await fetch(import.meta.env.VITE_SERVER_URL + "/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      icon: icon,
      userId: "67905ca5411c5dcf426c89c6",
    }),
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });

  if (response) {
    console.log(response);
  }
};

export const getProjects = async (userId: string) => {
  const response: IProject & { _id: string }[] = await fetch(
    import.meta.env.VITE_SERVER_URL + `/projects?userId=${userId}`
  )
    .then((res) => res.json())
    .catch((err) => console.error(err));

  // If response is empty, return an empty array
  if (!response) return [];

  // Remove _id and replace it with id by destructuring
  const transformedData = response.map(({ _id, ...project }) => {
    return {
      ...project,
      id: _id,
    };
  }) as IProject[];

  return transformedData;
};

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
