import CodeGenModal from "../components/modals/CodeGenModal";
import DeleteModal from "../components/modals/DeleteModal";
import DownloadModal from "../components/modals/DownloadModal";
import DrawerModal from "../components/modals/DrawerModal";
import ImageCropperModal from "../components/modals/ImageCropperModal";
import ManageAccountModal from "../components/modals/ManageAccountModal";
import SettingsModal from "../components/modals/SettingsModal";
import ShareModal from "../components/modals/ShareModal";

export const customModals = {
  drawer: DrawerModal,
  delete: DeleteModal,
  settings: SettingsModal,
  codeGen: CodeGenModal,
  download: DownloadModal,
  shareModal: ShareModal,
  manageAcc: ManageAccountModal,
  cropImage: ImageCropperModal,
};

declare module "@mantine/modals" {
  export interface MantineModalsOverride {
    modals: typeof customModals;
  }
}
