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
  id: string;
  profileUrl: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}
