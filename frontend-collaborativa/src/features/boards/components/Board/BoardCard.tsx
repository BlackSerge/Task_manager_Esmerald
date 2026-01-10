import React, { useState, useMemo } from "react";
import { Layout, CheckSquare, Clock, ArrowRight, Edit2, Trash2 } from "lucide-react";
import { Board } from "../../types/board.types";
import { formatDate } from "@/shared/utils/date.utils";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { EditableEntity } from "../EditableEntity"; 
import { usePermissions } from "../../hooks/usePermissions";
import { useBoardsStore } from "../../store/board.store";
import { useTimeTick } from "@/shared/hooks/useTimeTick";

// Importaciones de Shared
import { ProgressBar } from "@/shared/components/ui/ProgressBar";
import { StatItem } from "@/shared/components/ui/StatItem";
import { MemberAvatars } from "@/shared/components/ui/MemberAvatars";

interface BoardCardProps {
  board: Board;
  onClick: () => void;
  onEdit: (id: string, newTitle: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board: initialBoard, onClick, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const board = useBoardsStore((state) => 
    state.boards.find((b) => String(b.id) === String(initialBoard.id))
  ) || initialBoard;

  const tick = useTimeTick(1000);
  const { role, canEdit, canDelete, isAdmin } = usePermissions(board);
  
  const timeAgo = useMemo(() => {
    const displayDate = board.last_activity ?? board.updated_at ?? board.created_at;
    return formatDate(displayDate);
  }, [board.last_activity, board.updated_at, board.created_at, tick]);
  
  const progress = useMemo(() => {
    const total = board.total_cards ?? 0;
    const completed = board.completed_cards ?? 0;
    return total === 0 ? 0 : (board.progress_percentage ?? Math.round((completed / total) * 100));
  }, [board.completed_cards, board.total_cards, board.progress_percentage]);

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
        confirmText: "Eliminar"
      },
      onClick: () => onDelete(board.id.toString(), board.title)
    }] : [])
  ], [canEdit, canDelete, board.id, board.title, onDelete]);

  return (
    <article 
      onClick={!isEditing ? onClick : undefined}
      className="group relative bg-white border border-emerald-100 rounded-[2.5rem] p-6 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500 cursor-pointer border-b-4 active:border-b-0 active:translate-y-1"
    >
      <header className="flex justify-between items-start mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-500 shadow-sm">
          <Layout size={24} />
        </div>
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
      </header>

      <main className="mb-6" onClick={(e) => isEditing && e.stopPropagation()}>
        <EditableEntity
          initialValue={board.title}
          isEditing={isEditing}
          onSave={(newTitle) => { onEdit(board.id.toString(), newTitle); setIsEditing(false); }}
          onCancel={() => setIsEditing(false)}
          className="text-2xl font-black text-emerald-950 truncate group-hover:text-emerald-600 transition-colors block w-full tracking-tight"
        />
      </main>

      <MemberAvatars 
        members={board.members} 
        limit={4} 
        showLabel={true} 
        className="mb-6" 
        />

      <section className="grid grid-cols-2 gap-4 mb-4">
        <StatItem icon={<Layout size={12} />} label="Secciones" value={board.columns_count ?? board.columns?.length ?? 0} />
        <StatItem icon={<CheckSquare size={12} />} label="Progreso" value={`${board.completed_cards ?? 0}/${board.total_cards ?? 0}`} border />
      </section>

      <ProgressBar percentage={progress} />

      <footer className="flex items-center justify-between pt-4 border-t border-emerald-50">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-tighter">
          <Clock size={12} className="text-emerald-300" />
          <span>Actualizado {timeAgo}</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          Entrar <ArrowRight size={14} />
        </div>
      </footer>
    </article>
  );
};