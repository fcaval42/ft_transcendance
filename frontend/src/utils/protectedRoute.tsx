// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("token");

  // Si pas de jeton, redirection automatique vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};