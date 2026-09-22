import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/status", {
          credentials: "include",
        });

        if (!response.ok) {
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated;
};

export const ProtectedRoute = () => {
  const isAuthenticated = useAuthStatus();

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const UnlogRoute = () => {
  const isAuthenticated = useAuthStatus();

  if (isAuthenticated === null) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/menu" replace />;
  }

  return <Outlet />;
};