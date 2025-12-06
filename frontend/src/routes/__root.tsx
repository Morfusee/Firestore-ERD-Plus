import { client } from "@/integrations/api/generated/client.gen";
import { Loader } from "@mantine/core";
import { QueryClient } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <TanStackQueryLayout />
    </>
  ),
  beforeLoad: () => {
    client.setConfig({
      baseUrl: import.meta.env.VITE_SERVER_URL,
    });
  },
  pendingComponent: Loader,
});
