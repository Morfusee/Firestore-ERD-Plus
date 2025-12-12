import "@mantine/core/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { ReactFlowProvider } from "@xyflow/react";
import { ContextMenuProvider } from "mantine-contextmenu";
import "mantine-contextmenu/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { SingletonHooksContainer } from "react-singleton-hook";
import { customModals } from "./constants/modalConstants.ts";
import { FirebaseAuthProvider } from "./integrations/firebase/firebase-auth-provider.tsx";

import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider.tsx";
import { routeTree } from "./routeTree.gen";

import "./css/index.css";

// Import configured API client to set up interceptors
// IMPORTANT: Keep this import, even if it seems unused
import "./integrations/api/client";
import { ReactiveThemeProvider } from "./integrations/mantine/mantine-context-provider.tsx";

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProvider.getContext(),
  },
  defaultPreload: "intent",
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <TanStackQueryProvider.Provider>
        <FirebaseAuthProvider>
          <ReactFlowProvider>
            <ReactiveThemeProvider>
              <SingletonHooksContainer />
              <ContextMenuProvider>
                <ModalsProvider modals={customModals}>
                  <Notifications />
                  <RouterProvider router={router} />
                </ModalsProvider>
              </ContextMenuProvider>
            </ReactiveThemeProvider>
          </ReactFlowProvider>
        </FirebaseAuthProvider>
      </TanStackQueryProvider.Provider>
    </React.StrictMode>
  );
}
