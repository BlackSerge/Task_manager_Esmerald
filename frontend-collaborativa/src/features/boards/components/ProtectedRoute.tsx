// src/components/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    // Si no hay token, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};