import { auth } from "@/integrations/firebase/firebase-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = auth.currentUser;

    if (!user) {
      throw redirect({ to: "/login" });
    }

    return;
  },
});

function RouteComponent() {
  return <Outlet />;
}
