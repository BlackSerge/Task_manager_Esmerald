import React, { useState, useMemo, useCallback } from "react";
import { Plus, Loader2, Lock, Edit2, Trash2 } from "lucide-react";
import { Column, Board, Card, CreateCardPayload } from "../../types/board.types";
import { EditableEntity } from "../EditableEntity";
import { TaskModal } from "./CardModal";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { DroppableWrapper } from "@/shared/components/dnd/DroppableWrapper";
import { CardItem } from "./CardItem"; 
import { getColumnStatusConfig } from "@/shared/utils/column.utils";
import { usePermissions } from "../../hooks/usePermissions";
import { useBoardOperations } from "../../hooks/useBoardOperations";

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
  const { addCard, removeColumn, updateColumn, updateCard, deleteCard, isProcessing } = useBoardOperations(String(board.id));
  
  const config = getColumnStatusConfig(column.title, index, totalColumns);

  const handleUpdateCard = useCallback((cardId: number, payload: Partial<Card> | string) => {
    const data = typeof payload === "string" ? { title: payload } : payload;
    updateCard({ cardId, payload: data });
  }, [updateCard]);

  const handleDeleteCard = useCallback((cardId: number) => {
    deleteCard({ columnId: column.id, cardId });
  }, [column.id, deleteCard]);

  // Manejador actualizado para persistir el cambio de título en el backend
  const handleUpdateColumnTitle = useCallback((val: string) => {
    updateColumn({ columnId: column.id, title: val });
    setIsEditingTitle(false);
  }, [column.id, updateColumn]);

  // Manejador actualizado para eliminar la columna
  const handleRemoveColumn = useCallback(() => {
    removeColumn(column.id);
  }, [column.id, removeColumn]);

  const handleCreateCard = useCallback((data: CreateCardPayload) => {
    addCard({ ...data, columnId: column.id });
    setIsModalOpen(false);
  }, [column.id, addCard]);

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
      requiresConfirmation: true, 
      onClick: handleRemoveColumn 
    }] : [])
  ], [canEdit, canDelete, handleRemoveColumn]);

  return (
    <div className={`w-80 rounded-[2.5rem] p-5 flex-shrink-0 flex flex-col max-h-[88vh] border transition-all duration-500 ${config.bg} backdrop-blur-xl shadow-xl`}>
      <header className="flex justify-between items-center mb-5 px-3">
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
                onSave={handleUpdateColumnTitle}
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
      </header>
      
      <DroppableWrapper id={column.id} className="flex-1 overflow-y-auto px-1 custom-scrollbar min-h-[150px]">
        <div className="space-y-4 pb-4">
          {column.cards?.map((card, cardIndex) => (
            <CardItem 
              key={`${column.id}-${card.id}`} 
              card={card} 
              index={cardIndex}
              isColumnDone={config.isDone}
              onDelete={canDelete ? () => handleDeleteCard(card.id) : undefined}
              onUpdate={canEdit ? (payload) => handleUpdateCard(card.id, payload) : undefined}
            />
          ))}
        </div>
      </DroppableWrapper>

      <footer className="mt-4 px-1">
        {isLoadingPermissions ? (
          <div className="w-full py-4 bg-slate-200/20 animate-pulse rounded-[1.8rem]" />
        ) : canEdit ? (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProcessing}
            className={`w-full py-4 border rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${config.button}`}
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isProcessing ? "Sincronizando..." : "Nueva Tarea"}
          </button>
        ) : (
          <div className="w-full py-4 bg-slate-100/50 border border-dashed border-slate-300 rounded-[1.8rem] flex items-center justify-center gap-2 opacity-60">
            <Lock size={14} className="text-slate-400" />
            <span className="text-[9px] font-black uppercase text-slate-400">Solo lectura ({role})</span>
          </div>
        )}
      </footer>

      {isModalOpen && canEdit && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateCard}
          columnId={column.id}
        />
      )}
    </div>
  );
};