import useAuth from "@/hooks/useAuth";
import { Box, Loader } from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // Check if the user is authenticated
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (loading)
    return (
      <Box className="w-screen h-screen grid place-content-center">
        <Loader />
      </Box>
    );

  !isAuthenticated
    ? navigate({ to: "/login" })
    : navigate({ to: "/app" });
}
