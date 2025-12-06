import useAuth from "@/hooks/useAuth";
import { Box, Loader } from "@mantine/core";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
});

function RouteComponent() {
  // Check if the user is authenticated
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <Box className="w-screen h-screen grid place-content-center">
        <Loader />
      </Box>
    );

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return <Outlet />;
}
