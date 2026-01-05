import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";

export const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Mientras no sepamos si hay token (hidratando), no renderizamos nada
  if (!isHydrated) return null; 

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};