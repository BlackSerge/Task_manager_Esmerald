import React from "react";
import { BoardMember, UserRole } from "@/features/boards/types";

interface MemberAvatarsProps {
  members?: BoardMember[];
  limit?: number;
  showLabel?: boolean; 
  showRoleBadge?: boolean; 
  className?: string; 
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-500",
  editor: "bg-blue-500",
  viewer: "bg-slate-400",
};

export const MemberAvatars: React.FC<MemberAvatarsProps> = ({ 
  members = [], 
  limit = 3, 
  showLabel = false,
  showRoleBadge = false,
  className = ""
}) => {
  if (!members || members.length === 0) return null;

  const displayMembers = members.slice(0, limit);
  const extraCount = Math.max(0, members.length - limit);

  const getInitials = (member: BoardMember): string => {
    const identifier = member.user.username || member.user.email || "??";
    return identifier.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex -space-x-3 items-center">
        {displayMembers.map((member, i) => {
          const username = member.user.username || member.user.email || "Usuario";
          const role = member.role || "viewer";

          return (
            <div
              key={member.user.id}
              className="relative group"
              title={`${username} (${role})`}
            >
              {showRoleBadge && (
                <div className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white z-10 
                  ${ROLE_COLORS[role as UserRole] ?? ROLE_COLORS.viewer}`} 
                />
              )}
              
              <div className={`
                  w-9 h-9 rounded-full border-2 border-white flex items-center justify-center 
                  text-[10px] font-black text-white uppercase shadow-sm transition-all 
                  group-hover:-translate-y-1 group-hover:scale-110 group-hover:z-20 cursor-help
                  ${i % 2 === 0 ? 'bg-emerald-500' : 'bg-emerald-700'}
                `}
              >
                {getInitials(member)}
              </div>
            </div>
          );
        })}

        {extraCount > 0 && (
          <div 
            className="w-9 h-9 rounded-full border-2 border-white bg-emerald-50 flex items-center justify-center text-[10px] font-black text-emerald-600 shadow-sm"
            title={`${extraCount} miembros más`}
          >
            +{extraCount}
          </div>
        )}
      </div>

      {showLabel && (
        <span className="text-[10px] font-black text-emerald-800/30 uppercase tracking-widest">
          Colaboradores
        </span>
      )}
    </div>
  );
};