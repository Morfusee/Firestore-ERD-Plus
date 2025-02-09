export interface IProject {
  id?: string;
  name: string;
  icon: string;
  data?: string;
  members: IProjectMembers[];
  createdAt: number;
  updatedAt: number;
}

export interface IProjectMembers {
  userId: string;
  role: string;
}
