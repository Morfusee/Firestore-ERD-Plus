import { IEditorDataSnapshot } from "./EditorStoreTypes";
import { IProjectMembers } from "./ProjectTypes";

export interface DownloadModalFormValues {
  fileName: string;
  fileType: fileTypes;
}

export interface DownloadModalProjectDetails {
  data: IEditorDataSnapshot;
  id?: string;
  name?: string | undefined;
  icon?: string | undefined;
  members?: IProjectMembers[] | undefined;
  createdAt?: number | undefined;
  updatedAt?: number | undefined;
}

export type fileTypes = "PNG" | "JPEG" | "JSON";
