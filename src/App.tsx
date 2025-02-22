import { MantineProvider, Notification } from "@mantine/core";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Routes,
} from "react-router-dom";
import FirestoreERD from "./pages/FirestoreERD";
import { useThemeStore } from "./store/globalStore";
import useTheme from "./hooks/useTheme";
import { useEffect } from "react";
import { Notifications } from "@mantine/notifications";
import { ReactFlowProvider } from "@xyflow/react";
import { ModalsProvider } from "@mantine/modals";
import DeleteModal from "./components/modals/DeleteModal";
import SettingsModal from "./components/modals/SettingsModal";
import useGlobalHotkeys from "./hooks/useGlobalHotkeys";
import { ContextMenuProvider } from "mantine-contextmenu";
import Login from "./pages/login";
import Register from "./pages/register";
import CodeGenModal from "./components/modals/CodeGenModal";
import ManageAccountModal from "./components/modals/ManageAccountModal";
import ShareModal from "./components/modals/ShareModal";
import DownloadModal from "./components/modals/DownloadModal";
import DrawerModal from "./components/modals/DrawerModal";
import ProtectedRoute from "./routes/ProtectedRoute";
import ImageCropperModal from "./components/modals/ImageCropperModal";

const modals = {
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
    modals: typeof modals;
  }
}

function App() {
  const { theme } = useThemeStore();

  // Invoke the global hotkeys
  useGlobalHotkeys();

  return (
    <ReactFlowProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ContextMenuProvider>
          <ModalsProvider modals={modals}>
            <Notifications />
            <AppRouting />
          </ModalsProvider>
        </ContextMenuProvider>
      </MantineProvider>
    </ReactFlowProvider>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<FirestoreERD />} />
        <Route path="/:projectId" element={<FirestoreERD />} />
      </Route>
    </>
  ),
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

function AppRouting() {
  const { theme, setTheme } = useThemeStore();
  const themeData = useTheme();

  /* I gave in. I shouldn't be using this, but there's no other choice. */
  useEffect(() => {
    setTheme(themeData);
  }, [themeData]);

  // Show nothing if theme is empty
  if (Object.keys(theme).length === 0) {
    return null;
  }

  return (
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={router}
    />
  );
}

export default App;
