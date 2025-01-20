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
import useTheme from "./utils/useTheme";
import { useEffect } from "react";
import { Notifications } from "@mantine/notifications";
import { ReactFlowProvider } from "@xyflow/react";
import { ModalsProvider } from "@mantine/modals";
import DeleteModal from "./components/DeleteModal";
import SettingsModal from "./components/modals/SettingsModal";
import useGlobalHotkeys from "./utils/useGlobalHotkeys";
import { ContextMenuProvider } from 'mantine-contextmenu';
import Login from "./pages/login";
import Register from "./pages/register";
import CodeGenModal from "./components/modals/CodeGenModal";
import ManageAccountModal from "./components/modals/ManageAccountModal";


const modals = {
  delete: DeleteModal,
  settings: SettingsModal,
  codeGen: CodeGenModal,
  manageAcc: ManageAccountModal,
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
      <Route path="/" element={<FirestoreERD />} />
      <Route path="/:projectId" element={<FirestoreERD />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
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
