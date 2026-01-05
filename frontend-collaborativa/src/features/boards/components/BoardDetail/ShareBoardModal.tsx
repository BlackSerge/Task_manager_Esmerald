import React, { useState } from "react";
import { X, Search, UserPlus, Shield, CheckCircle2, ArrowRight, User, Loader2, Trash2 } from "lucide-react";
import { Board, UserRole } from "../../types/board.types";
import { useBoardTeam } from "../../hooks/useBoardTeam";
import { AuthUser } from "@/features/auth/types/auth.types";

interface Props {
  board: Board;
  onClose: () => void;
}

export const ShareBoardModal: React.FC<Props> = ({ board, onClose }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    isSearching, 
    invite, 
    isInviting,
    removeMember,
    isRemoving 
  } = useBoardTeam(board.id.toString());
  
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('editor');
  const [showSuccess, setShowSuccess] = useState(false);

  
  const handleInvite = (): void => {
    if (!selectedUser) return;
    
    
    invite(
      { 
        user_id: selectedUser.id, 
        role: selectedRole 
      }, 
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setSelectedUser(null);
            setSearchQuery("");
          }, 2000);
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-emerald-100 animate-in fade-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-emerald-50 flex justify-between items-center bg-emerald-50/30">
          <div>
            <h2 className="text-2xl font-black text-emerald-950">Compartir</h2>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Tablero: {board.title}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-emerald-400 transition-all shadow-sm">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          
          {/* ESTADO 1: BÚSQUEDA */}
          {!selectedUser && !showSuccess && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  {isSearching ? <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" /> : <Search className="text-emerald-300" size={18} />}
                </div>
                <input 
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="w-full h-14 pl-12 pr-4 bg-emerald-50/50 border-2 border-emerald-100 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-emerald-900"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="bg-white rounded-3xl border border-emerald-100 shadow-xl max-h-48 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {searchResults.map(user => (
                    <button 
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                          <User size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-black text-emerald-950">{user.username}</p>
                          <p className="text-[10px] font-bold text-emerald-400">{user.email}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESTADO 2: CONFIGURACIÓN DE ROL */}
          {selectedUser && !showSuccess && (
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-6 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black">
                    {selectedUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Invitar a:</p>
                    <h3 className="font-black text-emerald-950 text-lg">{selectedUser.username}</h3>
                  </div>
                </div>

                <div className="flex gap-2">
                  {(['admin', 'editor', 'viewer'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedRole === role 
                          ? 'border-emerald-600 bg-white shadow-lg text-emerald-600 scale-105 z-10' 
                          : 'border-transparent bg-emerald-100/50 text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      <Shield size={14} />
                      <span className="text-[9px] font-black uppercase">{role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest text-emerald-500 hover:bg-emerald-50 transition-colors"
                >
                  Volver
                </button>
                <button 
                  onClick={handleInvite}
                  disabled={isInviting}
                  className="flex-[2] h-14 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  {isInviting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus size={18} /> Confirmar</>}
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 3: ÉXITO */}
          {showSuccess && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                <CheckCircle2 size={44} />
              </div>
              <h3 className="text-2xl font-black text-emerald-950">¡Invitación enviada!</h3>
            </div>
          )}

          {/* LISTA DE MIEMBROS ACTUALES */}
          {!showSuccess && (
            <div className="pt-6 border-t border-emerald-50">
              <h3 className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-4">
                Equipo ({board.members?.length})
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {board.members?.map(member => (
                  <div key={member.user.id} className="flex items-center justify-between group p-2 hover:bg-emerald-50/50 rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 font-black text-[10px]">
                        {member.user.username?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-emerald-900">{member.user.username}</span>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {member.role || 'miembro'}
                      </span>
                    </div>
                    
                    {board.owner.id !== member.user.id && (
                      <button 
                        onClick={() => removeMember(member.user.id)}
                        disabled={isRemoving}
                        className="p-2 text-emerald-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
                      >
                        {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};