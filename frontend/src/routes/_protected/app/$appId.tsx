import FirestoreERD from "@/pages/FirestoreERD";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/app/$appId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FirestoreERD />;
}
