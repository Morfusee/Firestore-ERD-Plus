import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { ReactFlowProvider } from "@xyflow/react";
import { ContextMenuProvider } from "mantine-contextmenu";
import {
  RouterProvider
} from "react-router-dom";
import { SingletonHooksContainer } from "react-singleton-hook";
import { customModals } from "./constants/modalConstants";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";
import useGlobalHotkeys from "./hooks/useGlobalHotkeys";
import useTheme from "./hooks/useTheme";
import { AppRoutes } from "./routes/AppRoutes";
import { useThemeStore } from "./store/globalStore";

function App() {
  const { theme } = useThemeStore();
  return (
    <FirebaseAuthProvider>
      <ReactFlowProvider>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <SingletonHooksContainer />
          <ContextMenuProvider>
            <ModalsProvider modals={customModals}>
              <Notifications />
              <AppRouting />
            </ModalsProvider>
          </ContextMenuProvider>
        </MantineProvider>
      </ReactFlowProvider>
    </FirebaseAuthProvider>
  );
}

function AppRouting() {
  const { theme } = useThemeStore();

  // Invoke the useTheme hook to update the theme
  const themeData = useTheme();

  // Invoke the global hotkeys
  useGlobalHotkeys();

  // Show nothing if the theme is empty
  if (Object.keys(theme).length === 0) {
    return null;
  }

  return (
    <RouterProvider
      future={{
        v7_startTransition: true,
      }}
      router={AppRoutes}
    />
  );
}

export default App;
