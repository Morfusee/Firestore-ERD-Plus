import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../data/repo/useAuth";
import { Box, Loader } from "@mantine/core";

function ProtectedRoute() {
  // Check if the user is authenticated
  const { isAuthenticated, loading } = useAuth();

  if (loading)
    return (
      <Box className="w-screen h-screen grid place-content-center">
        <Loader />
      </Box>
    );

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
