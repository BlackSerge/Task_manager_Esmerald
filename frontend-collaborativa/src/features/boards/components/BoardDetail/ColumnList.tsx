import React, { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Loader2, Lock } from "lucide-react";

import { Column, Board, Card } from "../../types/board.types"; // Añadimos Card
import { EditableEntity } from "../EditableEntity";
import { TaskModal } from "./TaskModal";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { DroppableWrapper } from "@/shared/components/dnd/DroppableWrapper";
import { CardItem } from "./CardItem"; 
import { useColumnActions, CreateCardDTO } from "../../hooks/useColumnActions";
import { getColumnStatusConfig } from "@/shared/utils/column.utils";
import { usePermissions } from "../../hooks/usePermissions";

interface Props {
  column: Column;
  board: Board;
  index: number;
  totalColumns: number;
}

export const ColumnList: React.FC<Props> = ({ column, board, index, totalColumns }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const { canEdit, canDelete, role, isLoading: isLoadingPermissions } = usePermissions(board);
  const { isCreatingCard, ...actions } = useColumnActions(board.id.toString(), column.id);
  const config = getColumnStatusConfig(column.title, index, totalColumns);


  const handleUpdateCard = (cardId: number, payload: Partial<Card> | string) => {
    if (typeof payload === "string") {
      actions.updateCard(cardId, { title: payload });
    } else {
      actions.updateCard(cardId, payload);
    }
  };

  const menuOptions = useMemo(() => [
    ...(canEdit ? [{ 
      label: "Editar nombre", 
      icon: <Edit2 size={14} />, 
      onClick: () => setIsEditingTitle(true) 
    }] : []),
    ...(canDelete ? [{ 
      label: "Eliminar lista", 
      icon: <Trash2 size={14} />, 
      variant: "danger" as const, 
      onClick: actions.deleteColumn 
    }] : [])
  ], [canEdit, canDelete, actions.deleteColumn]);

  return (
    <div className={`w-80 rounded-[2.5rem] p-5 flex-shrink-0 flex flex-col max-h-[88vh] border transition-all duration-500 ${config.bg} backdrop-blur-xl shadow-xl`}>
      
      {/* Header de la Columna */}
      <div className="flex justify-between items-center mb-5 px-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-0.5">
            <span className={`text-[7px] font-black uppercase tracking-[0.2em] opacity-40 ${config.text}`}>
              {config.label}
            </span>
            <div className="flex items-center gap-2">
              {!isEditingTitle && config.icon}
              <EditableEntity
                initialValue={column.title}
                isEditing={isEditingTitle && canEdit}
                onSave={(val) => { actions.updateColumn(val); setIsEditingTitle(false); }}
                onCancel={() => setIsEditingTitle(false)}
                className={`font-black text-xs uppercase tracking-[0.2em] truncate ${config.text}`}
              />
              {!isEditingTitle && (
                <span className="bg-white/90 text-emerald-700 px-2.5 py-1 rounded-full text-[9px] font-black border border-emerald-100/50 shadow-sm ml-1">
                  {column.cards?.length || 0}
                </span>
              )}
            </div>
          </div>
        </div>
        {!isEditingTitle && menuOptions.length > 0 && <DropdownMenu options={menuOptions} />}
      </div>
      
      {/* Área de Tarjetas */}
      <DroppableWrapper id={column.id} className="flex-1 overflow-y-auto px-1 custom-scrollbar min-h-[150px]">
        <div className="space-y-4 pb-4">
          {column.cards?.map((card, cardIndex) => (
            <CardItem 
              key={`${column.id}-${card.id}`} 
              card={card} 
              index={cardIndex}
              isColumnDone={config.isDone}
              onDelete={canDelete ? () => actions.deleteCard(card.id) : undefined}
              // 🚀 Refactorizado para aceptar el payload completo (objeto)
              onUpdate={canEdit ? (payload) => handleUpdateCard(card.id, payload) : undefined}
            />
          ))}
        </div>
      </DroppableWrapper>

      {/* Footer: Botón Nueva Tarea */}
      <div className="mt-4 px-1">
        {isLoadingPermissions ? (
          <div className="w-full py-4 bg-slate-200/20 animate-pulse rounded-[1.8rem]" />
        ) : canEdit ? (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isCreatingCard}
            className={`w-full py-4 border rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${config.button}`}
          >
            {isCreatingCard ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isCreatingCard ? "Sincronizando..." : "Nueva Tarea"}
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-100/50 border border-dashed border-slate-300 rounded-[1.8rem] flex items-center justify-center gap-2 opacity-60">
            <Lock size={14} className="text-slate-400" />
            <span className="text-[9px] font-black uppercase text-slate-400">Solo lectura ({role})</span>
          </div>
        )}
      </div>

      {isModalOpen && canEdit && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data: CreateCardDTO) => actions.createCard(data, () => setIsModalOpen(false))}
          columnId={column.id}
        />
      )}
    </div>
  );
};