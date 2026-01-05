import React, { useState } from "react";
import { Card, BoardMember } from "../types/board.types";
import { DraggableWrapper } from "@/shared/components/dnd/DraggableWrapper";
import { EditableEntity } from "./EditableEntity";
import { PriorityBadge } from "./PriorityBadge";
import { DateDisplay } from "@/shared/components/ui/DateDisplay";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { 
  Edit2, 
  Trash2, 
  GripVertical, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert, 
  User 
} from "lucide-react";

interface CardItemProps {
  card: Card;
  index: number;
  isColumnDone: boolean;
  onDelete?: () => void; // Opcionales para manejar permisos
  onUpdate?: (val: string) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ 
  card, 
  index, 
  isColumnDone, 
  onDelete, 
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // 1. Helper para renderizar el identificador de permiso del dueño
  const renderOwnerBadge = (owner?: BoardMember) => {
    if (!owner) return null;

    const roleIcons = {
      admin: <ShieldCheck size={11} className="text-red-500" />,
      editor: <ShieldAlert size={11} className="text-blue-500" />,
      viewer: <User size={11} className="text-slate-400" />
    };

    return (
      <div 
        className="flex items-center gap-1.5 bg-emerald-50/50 px-2 py-1 rounded-full border border-emerald-100/50 group-hover:bg-white transition-all shadow-sm"
        title={`${owner.email} (${owner.role})`}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] font-black text-white uppercase shrink-0">
          {owner.email.substring(0, 2)}
        </div>
        <span className="text-[9px] font-black text-emerald-900/60 uppercase tracking-tighter">
          {owner.role}
        </span>
        {roleIcons[owner.role] || roleIcons.viewer}
      </div>
    );
  };

  return (
    <DraggableWrapper id={card.id} index={index}>
      {(isDragging) => (
        <div className={`
          group relative bg-white p-5 rounded-[2.2rem] border transition-all duration-300 ease-out
          ${isDragging 
            ? "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-emerald-400/60 scale-[1.05] z-[9999] w-[280px]" 
            : "shadow-sm border-emerald-50/50 hover:border-emerald-200 hover:shadow-md cursor-grab active:cursor-grabbing"
          }
          ${isColumnDone && !isDragging ? "opacity-80" : "opacity-100"}
        `}>
          
          {/* Handle de arrastre */}
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 transition-opacity ${isDragging ? 'opacity-0' : 'group-hover:opacity-100 opacity-0'}`}>
            <GripVertical size={18} strokeWidth={2.5} />
          </div>

          {/* Header de la tarjeta */}
          <div className="flex justify-between items-start mb-3 pl-3">
            <div className="flex items-center gap-2">
               <PriorityBadge priority={card.priority} />
               {isColumnDone && <CheckCircle2 size={12} className="text-emerald-500" />}
            </div>
            
            {!isEditing && onDelete && onUpdate && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu
                  options={[
                    { label: "Editar", icon: <Edit2 size={14} />, onClick: () => setIsEditing(true) },
                    { label: "Borrar", icon: <Trash2 size={14} />, variant: "danger", onClick: onDelete }
                  ]}
                />
              </div>
            )}
          </div>

          <div className="px-3">
            <EditableEntity
              initialValue={card.title}
              isEditing={isEditing}
              onSave={(val) => { onUpdate?.(val); setIsEditing(false); }}
              onCancel={() => setIsEditing(false)}
              className={`text-[14px] font-black leading-snug block mb-2 tracking-tight transition-all
                ${isColumnDone ? "text-emerald-900/50 line-through decoration-emerald-500/30" : "text-emerald-950"}
              `}
            />

            {!isEditing && card.description && (
              <p className={`text-[11.5px] line-clamp-2 leading-relaxed font-medium mb-3 ${isColumnDone ? "text-emerald-600/40" : "text-emerald-600/75"}`}>
                {card.description}
              </p>
            )}

            {/* Footer de la tarjeta con Dueño y Fecha */}
            <div className={`mt-4 pt-3 border-t border-emerald-50/50 flex justify-between items-center ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
              <DateDisplay date={card.created_at} />
              
              {/* Mostramos el responsable/dueño en lugar del círculo vacío */}
              {renderOwnerBadge(card.owner)}
            </div>
          </div>
        </div>
      )}
    </DraggableWrapper>
  );
};