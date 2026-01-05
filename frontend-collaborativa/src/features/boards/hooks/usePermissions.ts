import { useAuthStore } from "@/features/auth/store/auth.store";
import { Board, UserRole } from "../types/board.types";

interface BoardPermissions {
  role: UserRole;
  isAdmin: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  isLoading: boolean;
}


export const usePermissions = (board: Board | undefined): BoardPermissions => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  // 1. Estado de carga o falta de datos: Acceso mínimo por seguridad
  if (!isHydrated || !board || !user) {
    return { 
      role: 'viewer', 
      isAdmin: false,
      canEdit: false, 
      canDelete: false, 
      canShare: false, 
      isLoading: !isHydrated 
    };
  }


  const isOwner = Number(board.owner?.id) === Number(user.id);
  
  // Determinamos el rol: Prioridad al Admin por propiedad, luego al rol del backend
  const role: UserRole = isOwner ? 'admin' : (board.current_user_role || 'viewer');

  return {
    role,
    isAdmin: role === 'admin',
    canEdit: role === 'admin' || role === 'editor',
    canDelete: role === 'admin',
    canShare: role === 'admin',
    isLoading: false
  };
};