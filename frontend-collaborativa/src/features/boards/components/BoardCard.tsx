import React, { useState, useMemo } from "react";
import { Layout, CheckSquare, Clock, ArrowRight, Edit2, Trash2 } from "lucide-react";
import { Board, BoardMember } from "../types/board.types";
import { formatDate } from "@/shared/utils/date.utils";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { EditableEntity } from "./EditableEntity"; 
import { usePermissions } from "../hooks/usePermissions";

interface BoardCardProps {
  board: Board;
  onClick: () => void;
  onEdit: (id: string, newTitle: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { role, canEdit, canDelete, isAdmin } = usePermissions(board);
  
  // Prioridad de fecha: Actividad reciente > Modificación > Creación
  const displayDate = board.last_activity ?? board.updated_at ?? board.created_at;

  // Cálculo de porcentaje seguro para evitar NaN
  const progress = useMemo(() => {
    if (!board.total_cards || board.total_cards === 0) return 0;
    return Math.round(((board.completed_cards ?? 0) / board.total_cards) * 100);
  }, [board.completed_cards, board.total_cards]);

  const handleSaveTitle = (newTitle: string): void => {
    onEdit(board.id.toString(), newTitle);
    setIsEditing(false);
  };

  const menuOptions = useMemo(() => [
    ...(canEdit ? [{
      label: "Editar título",
      icon: <Edit2 size={14} />,
      onClick: () => setIsEditing(true)
    }] : []),
    ...(canDelete ? [{
      label: "Eliminar tablero",
      icon: <Trash2 size={14} />,
      variant: "danger" as const,
      requiresConfirmation: true,
      confirmationConfig: {
        title: `¿Eliminar "${board.title}"?`,
        description: "Esta acción no se puede deshacer.",
        confirmText: "Eliminar permanentemente"
      },
      onClick: () => onDelete(board.id.toString(), board.title)
    }] : [])
  ], [canEdit, canDelete, board.id, board.title, onDelete]);

  return (
    <div 
      onClick={!isEditing ? onClick : undefined}
      className="group relative bg-white border border-emerald-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer border-b-4 active:border-b-0 active:translate-y-1"
    >
      {/* Header: Icono + Badge + Menu */}
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 shadow-sm">
          <Layout size={24} />
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${
              isAdmin ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {role}
            </span>
            {menuOptions.length > 0 && (
              <DropdownMenu triggerClassName="text-emerald-400 hover:text-emerald-600 p-1" options={menuOptions} />
            )}
          </div>
        </div>
      </div>

      {/* Título Editable */}
      <div className="mb-6" onClick={(e) => isEditing && e.stopPropagation()}>
        <EditableEntity
          initialValue={board.title}
          isEditing={isEditing}
          onSave={handleSaveTitle}
          onCancel={() => setIsEditing(false)}
          className="text-2xl font-black text-emerald-950 truncate group-hover:text-emerald-600 transition-colors block w-full tracking-tight"
        />
      </div>

      {/* Miembros del equipo */}
      <MemberAvatars members={board.members} />

      {/* Estadísticas: Secciones y Tareas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <StatItem 
          icon={<Layout size={12} />} 
          label="Secciones" 
          value={board.columns_count ?? 0} 
        />
        <StatItem 
          icon={<CheckSquare size={12} />} 
          label="Progreso" 
          value={`${board.completed_cards ?? 0}/${board.total_cards ?? 0}`} 
          border 
        />
      </div>

      {/* Barra de Progreso con Porcentaje */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <span className="text-emerald-800/40 text-[9px]">Completado</span>
          <span className="text-emerald-600">{progress}%</span>
        </div>
        <ProgressBar percentage={progress} />
      </div>

      {/* Footer: Fecha y Acción */}
      <div className="flex items-center justify-between pt-4 border-t border-emerald-50">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-tighter">
          <Clock size={12} className="text-emerald-300" />
          <span>Actualizado {formatDate(displayDate)}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          Entrar <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

// --- Subcomponentes Optimizados ---

const MemberAvatars: React.FC<{ members?: BoardMember[] }> = ({ members = [] }) => {
  const limit = 4;
  const displayMembers = members.slice(0, limit);
  const remaining = members.length - limit;

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex -space-x-3 overflow-hidden">
        {displayMembers.map((m) => (
          <div 
            key={m.user.id}
            className="h-9 w-9 rounded-full ring-4 ring-white bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[11px] font-black text-emerald-700 uppercase"
            title={m.user.username}
          >
            {m.user.username?.substring(0, 2) || "??"}
          </div>
        ))}
        {remaining > 0 && (
          <div className="h-9 w-9 rounded-full ring-4 ring-white bg-emerald-900 flex items-center justify-center text-[10px] font-bold text-white">
            +{remaining}
          </div>
        )}
      </div>
      <span className="text-[10px] font-black text-emerald-800/30 uppercase tracking-widest">
        Colaboradores
      </span>
    </div>
  );
};

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number; border?: boolean }> = ({ icon, label, value, border }) => (
  <div className={`flex flex-col gap-1 ${border ? 'border-l border-emerald-50 pl-4' : ''}`}>
    <span className="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest flex items-center gap-1.5">
      {icon} {label}
    </span>
    <span className="text-xl font-black text-emerald-950 tabular-nums">{value}</span>
  </div>
);

const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="h-2.5 w-full bg-emerald-50 rounded-full overflow-hidden shadow-inner border border-emerald-100/50">
    <div 
      className={`h-full transition-all duration-1000 ease-out rounded-full ${
        percentage === 100 ? 'bg-amber-500' : 'bg-emerald-500'
      }`}
      style={{ width: `${Math.max(2, percentage)}%` }} // Mínimo 2% para que se vea el inicio
    />
  </div>
);