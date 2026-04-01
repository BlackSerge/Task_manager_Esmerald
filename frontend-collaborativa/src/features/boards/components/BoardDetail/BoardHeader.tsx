import React, { useState } from "react";
import { UserPlus, Lock, ShieldCheck } from "lucide-react";
import { Board } from "../../types";
import { usePermissions } from "../../hooks/usePermissions";
import { ShareBoardModal } from "./ShareBoardModal";

export const BoardHeader: React.FC<{ board: Board }> = ({ board }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { canShare, role } = usePermissions(board);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 p-8 bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 shadow-xl shadow-emerald-900/5">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">
              {board.title}
            </h1>
            <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={12} />
              {role}
            </div>
          </div>
          <p className="text-emerald-800/40 text-xs font-bold uppercase tracking-[0.2em] ml-1">
            Panel de Gestión de Cartera
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end gap-2">
            <span className="text-[9px] font-black text-emerald-800/30 uppercase tracking-widest mr-2">
              Equipo del Proyecto ({board.members?.length || 0})
            </span>
            <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
              {board.members?.map((member) => (
                <div 
                  key={member.user.id}
                  className="w-12 h-12 rounded-2xl border-4 border-white bg-white flex items-center justify-center shadow-lg group relative cursor-pointer"
                >
                  <div className="w-full h-full rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                     {member.user.username?.substring(0, 2).toUpperCase() ?? "??"}
                  </div>

                  {/* Tooltip con Rol */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all z-50 pointer-events-none">
                    <div className="bg-emerald-950 text-white text-[9px] py-2 px-3 rounded-xl font-black whitespace-nowrap shadow-2xl">
                      {member.user.username ?? "Usuario"} • <span className="text-emerald-400">{member.role ?? "viewer"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canShare ? (
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="h-16 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-emerald-600/30"
            >
              <UserPlus size={20} />
              Compartir
            </button>
          ) : (
            <div className="h-16 px-8 bg-slate-100 rounded-[2rem] border border-dashed border-slate-300 flex items-center gap-3 opacity-60">
              <Lock size={18} className="text-slate-400" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Solo lectura</span>
            </div>
          )}
        </div>
      </header>

      {isShareModalOpen && (
        <ShareBoardModal 
          board={board} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}
    </>
  );
};