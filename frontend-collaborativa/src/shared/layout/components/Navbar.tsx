import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { LogOut, Layout, MessageSquare, UserPlus } from "lucide-react"; 
import { useAuthStore } from "@/features/auth";
import { useNavBarStore } from "@/shared/components/stores/navbar.store";
import { useBoardsStore, ShareBoardModal } from "@/features/boards";
import { MemberAvatars } from "@/shared/components/ui/MemberAvatars";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isChatOpen, toggleChat } = useNavBarStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const location = useLocation();
  const { boardId } = useParams<{ boardId: string }>(); 
  const board = useBoardsStore((state) => 
    state.boards.find(b => String(b.id) === String(boardId))
  );
  
  const isBoardDetail = location.pathname.includes("/boards/") && !!boardId;
  const members = board?.members ?? [];

  return (
    <nav className="bg-white border-b-2 border-emerald-100/50 h-20 flex items-center justify-between px-8 sticky top-0 z-[500] shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/boards" className="flex items-center gap-2 group">
          <div className="bg-emerald-600 p-2 rounded-xl group-hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 group-hover:-rotate-6">
             <Layout className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-black text-emerald-950 tracking-tighter uppercase">Emerald</span>
        </Link>

        {/* AVATARES DE MIEMBROS*/}
        {isBoardDetail && members.length > 0 && (
          <div className="hidden xl:block border-l border-emerald-100 pl-8">
            <MemberAvatars 
              members={members} // Pasamos la variable segura 'members'
              limit={5} 
              showRoleBadge={true} // En Navbar sí queremos ver los roles
              showLabel={false}    // En Navbar no hace falta el texto "Colaboradores"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isBoardDetail && (
          <>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!board}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-all hover:-translate-y-1 active:scale-95 shadow-sm disabled:opacity-50"
            >
              <UserPlus size={16} />
              <span className="hidden md:inline">Compartir</span>
            </button>

            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-emerald-950 rounded-2xl border border-emerald-800 shadow-lg shadow-emerald-200/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live</span>
            </div>

            <button 
              onClick={toggleChat}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-90 border ${
                isChatOpen 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200" 
                  : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
              }`}
            >
              <MessageSquare size={18} />
              <span>{isChatOpen ? "Cerrar" : "Chat"}</span>
            </button>
          </>
        )}
        
        {!isBoardDetail && (
          <div className="text-right hidden sm:block border-r border-emerald-100 pr-4">
            <p className="text-sm font-black text-emerald-900 leading-none">{user?.username ?? 'Invitado'}</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1 italic">Pro Member</p>
          </div>
        )}
        
        <button
          onClick={logout}
          title="Cerrar sesión"
          className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:-translate-y-1 transition-all active:scale-90 border border-emerald-100/50"
        >
          <LogOut size={22} />
        </button>
      </div>

      {/* Modal Seguro */}
      {isInviteModalOpen && board && (
        <ShareBoardModal
          board={board} 
          onClose={() => setIsInviteModalOpen(false)} 
        />
      )}
    </nav>
  );
};