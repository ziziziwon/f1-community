
import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../stores/auth";

export default function RequireAuth({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
