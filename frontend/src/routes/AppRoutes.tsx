import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import FirestoreERD from "../pages/FirestoreERD";
import ForgotPasswordPage from "../pages/forgot-password";
import Login from "../pages/login";
import Register from "../pages/register";
import ProtectedRoute from "./ProtectedRoute";

export const AppRoutes = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<FirestoreERD />} />
        <Route path="/:projectId" element={<FirestoreERD />} />
      </Route>
    </>
  ),
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);
