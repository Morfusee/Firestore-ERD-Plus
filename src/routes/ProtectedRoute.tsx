import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Box, Loader } from "@mantine/core";
import EmailVerification from "../pages/email-verification";

function ProtectedRoute() {
  // Check if the user is authenticated
  const { isAuthenticated, emailVerified, loading } = useAuth();

  if (loading)
    return (
      <Box className="w-screen h-screen grid place-content-center">
        <Loader />
      </Box>
    );

  if (!emailVerified) return <EmailVerification />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
