import { useAuthStore } from "@/features/auth/store/auth.store";
import { Board,UserRole } from "../types";

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