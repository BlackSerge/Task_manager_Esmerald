import React, { useState, useMemo, useCallback } from "react";
import { 
  Trash2, CheckCircle2, Circle, 
  ShieldCheck, ShieldAlert, User, AlignLeft, ChevronRight 
} from "lucide-react";

import { Card, BoardMember, PriorityLevel, CreateCardPayload } from "../../types/board.types";
import { DraggableWrapper } from "@/shared/components/dnd/DraggableWrapper";
import { PriorityBadge } from "../Board/PriorityBadge";
import { DateDisplay } from "@/shared/components/ui/DateDisplay";
import { DropdownMenu, DropdownOption } from "@/shared/components/ui/DropdownMenu";
import { TaskModal } from "./CardModal";

interface CardItemProps {
  card: Card;
  index: number;
  isColumnDone: boolean;
  onDelete?: () => void; 
  onUpdate?: (payload: Partial<Card>) => void; 
}

export const CardItem: React.FC<CardItemProps> = ({ 
  card, index, isColumnDone, onDelete, onUpdate 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derivamos el estado de completado
  const effectiveIsCompleted = card.is_completed || isColumnDone;

  const handleToggleComplete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.({ is_completed: !card.is_completed });
  }, [card.is_completed, onUpdate]);

  const handleUpdatePriority = useCallback((priority: PriorityLevel) => {
    onUpdate?.({ priority });
  }, [onUpdate]);

  const handleModalSave = useCallback((data: CreateCardPayload) => {
    onUpdate?.(data);
    setIsModalOpen(false);
  }, [onUpdate]);

  const priorityOptions: DropdownOption[] = useMemo(() => [
    { label: "Baja", icon: <ChevronRight size={14} />, onClick: () => handleUpdatePriority('low') },
    { label: "Media", icon: <ChevronRight size={14} />, onClick: () => handleUpdatePriority('medium') },
    { label: "Alta", icon: <ChevronRight size={14} />, onClick: () => handleUpdatePriority('high') },
  ], [handleUpdatePriority]);


  const menuOptions: DropdownOption[] = useMemo(() => [
    { label: "Editar Detalles", icon: <AlignLeft size={14} />, onClick: () => setIsModalOpen(true) },
    ...(onDelete ? [{ label: "Eliminar", icon: <Trash2 size={14} />, variant: "danger" as const, onClick: onDelete }] : [])
  ], [onDelete]);

  const renderOwnerBadge = (owner?: BoardMember) => {
    if (!owner?.user) return null;
    const roleIcons = {
      admin: <ShieldCheck size={11} className="text-red-500" />,
      editor: <ShieldAlert size={11} className="text-blue-500" />,
      viewer: <User size={11} className="text-slate-400" />
    };

    return (
      <div className="flex items-center gap-1.5 bg-emerald-50/50 px-2 py-1 rounded-full border border-emerald-100/50 shadow-sm">
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] font-black text-white uppercase shrink-0">
          {owner.user.username.substring(0, 2)}
        </div>
        <span className="text-[9px] font-black text-emerald-900/60 uppercase tracking-tighter">
          {owner.role}
        </span>
        {roleIcons[owner.role as keyof typeof roleIcons]}
      </div>
    );
  };

  return (
    <>
      <DraggableWrapper id={card.id} index={index}>
        {(isDragging) => (
          <div className={`
            group relative p-5 rounded-[2.2rem] border transition-all duration-300 ease-out bg-white
            ${isDragging 
              ? "shadow-2xl border-emerald-400 scale-[1.05] z-50" 
              : "shadow-sm border-emerald-50/50 hover:border-emerald-200"
            }
            ${effectiveIsCompleted && !isDragging ? "bg-slate-50/50 opacity-80" : ""}
          `}>
            
            <div className="flex justify-between items-start mb-3 pl-1">
              <div className="flex items-center gap-2">
                 <button onClick={handleToggleComplete} className="transition-transform active:scale-90 outline-none">
                   {effectiveIsCompleted
                      ? <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-50" />
                      : <Circle size={18} className="text-slate-300 hover:text-emerald-400" />
                   }
                 </button>
                 <DropdownMenu options={priorityOptions}>
                    <PriorityBadge priority={card.priority} />
                 </DropdownMenu>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu options={menuOptions} />
              </div>
            </div>

            <div className="px-1">
              {/* Título: Ahora es un elemento estático que abre el modal al hacer clic */}
              <h3 
                onClick={() => setIsModalOpen(true)}
                className={`text-[14px] font-black leading-snug block mb-2 tracking-tight cursor-pointer hover:text-emerald-700 transition-colors
                  ${effectiveIsCompleted ? "text-slate-400 line-through decoration-slate-300" : "text-emerald-950"}
                `}
              >
                {card.title}
              </h3>

              <div 
                className={`mt-2 text-[11.5px] leading-relaxed font-medium mb-3 block cursor-pointer hover:bg-emerald-50/60 rounded-xl p-2 transition-all border border-transparent hover:border-emerald-100/50
                  ${effectiveIsCompleted ? "text-slate-300" : "text-emerald-600/75"}
                  ${!card.description && "italic opacity-50"}
                `}
                onClick={() => setIsModalOpen(true)}
              >
                {card.description || "Añadir una descripción detallada..."}
              </div>

              <div className={`mt-4 pt-3 border-t border-emerald-50/50 flex justify-between items-center ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
                {card.created_at && <DateDisplay date={card.created_at} />}
                {renderOwnerBadge(card.owner)}
              </div>
            </div>
          </div>
        )}
      </DraggableWrapper>

      {isModalOpen && (
        <TaskModal 
          key={`edit-${card.id}`}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
          initialData={card} 
          columnId={0} 
        />
      )}
    </>
  );
};