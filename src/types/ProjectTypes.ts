export interface IProject {
  id?: string;
  name: string;
  icon: string;
  diagramData?: string;
  members: IProjectMembers[];
  createdAt: number;
  updatedAt: number;
}

export interface IProjectMembers {
  userId: string;
  role: string;
}
