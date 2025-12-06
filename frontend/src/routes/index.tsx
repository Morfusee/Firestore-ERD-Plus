import { auth } from "@/integrations/firebase/firebase-client";
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
