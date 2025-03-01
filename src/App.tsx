import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ReactFlowProvider } from "@xyflow/react";
import { ContextMenuProvider } from "mantine-contextmenu";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";
import { customModals } from "./constants/modalConstants";
import useGlobalHotkeys from "./hooks/useGlobalHotkeys";
import useTheme from "./hooks/useTheme";
import FirestoreERD from "./pages/FirestoreERD";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useThemeStore } from "./store/globalStore";

function App() {
  const { theme } = useThemeStore();
  return (
    <ReactFlowProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <ContextMenuProvider>
          <ModalsProvider modals={customModals}>
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

  // Invoke the useTheme hook to update the theme
  const themeData = useTheme();

  // Invoke the global hotkeys
  useGlobalHotkeys();

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
