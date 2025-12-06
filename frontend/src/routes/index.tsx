import { auth } from "@/integrations/firebase/initialize-firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: async () => {
    // CHeck if the user is authenticated
    const user = auth.currentUser;

    if (!user) {
      throw redirect({ to: "/login" });
    }

    throw redirect({ to: "/app" });
  },
});

function RouteComponent() {}
