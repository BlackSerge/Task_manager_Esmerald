import React, { useState, useCallback, useMemo } from "react";
import { Plus, Loader2, Lock, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types & Config
import { Column, Board, Card, CreateCardPayload } from "../../types/board.types";
import { getColumnStatusConfig } from "@/shared/utils/column.utils";

// Shared & Feature Components
import { EditableEntity } from "../EditableEntity";
import { TaskModal } from "./CardModal";
import { DropdownMenu } from "@/shared/components/ui/DropdownMenu";
import { DroppableWrapper } from "@/shared/components/dnd/DroppableWrapper";
import { CardItem } from "./CardItem"; 

// Hooks
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

  const { canEdit, canDelete, isLoading: isLoadingPermissions } = usePermissions(board);
  const { addCard, removeColumn, updateColumn, updateCard, deleteCard, isProcessing } = useBoardOperations(String(board.id));
  
  const config = getColumnStatusConfig(column.title, index, totalColumns);

  const handleUpdateCard = useCallback((cardId: number, payload: Partial<Card> | string) => {
    const data = typeof payload === "string" ? { title: payload } : payload;
    updateCard({ cardId, columnId: column.id, payload: data });
  }, [column.id, updateCard]);

  const handleDeleteCard = useCallback((cardId: number) => {
    deleteCard({ columnId: column.id, cardId });
  }, [column.id, deleteCard]);

  const handleUpdateColumnTitle = useCallback((val: string) => {
    updateColumn({ columnId: column.id, title: val });
    setIsEditingTitle(false);
  }, [column.id, updateColumn]);

  const handleRemoveColumn = useCallback(() => removeColumn(column.id), [column.id, removeColumn]);

  const handleCreateCard = useCallback((data: CreateCardPayload) => {
    addCard({ ...data, columnId: column.id });
    setIsModalOpen(false);
  }, [column.id, addCard]);

  const menuOptions = useMemo(() => [
    ...(canEdit ? [{ label: "Editar nombre", icon: <Edit2 size={14} />, onClick: () => setIsEditingTitle(true) }] : []),
    ...(canDelete ? [{ label: "Eliminar lista", icon: <Trash2 size={14} />, variant: "danger" as const, requiresConfirmation: true, onClick: handleRemoveColumn }] : [])
  ], [canEdit, canDelete, handleRemoveColumn]);

  return (
    <div className={`
      /* ELASTICIDAD: h-fit permite que la columna crezca con las tarjetas */
      w-full h-fit max-h-[88vh] 
      rounded-[2.8rem] p-6 flex flex-col border 
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      ${config.bg} backdrop-blur-2xl shadow-2xl
      /* Evitamos que la sombra del CardItem se corte */
      overflow-visible 
    `}>
      <header className="flex justify-between items-start mb-5 px-2 shrink-0">
        <div className="flex-1 min-w-0">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-50 ${config.text}`}>
            {config.label}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="shrink-0 scale-90">{config.icon}</div>
            <EditableEntity
              initialValue={column.title}
              isEditing={isEditingTitle && canEdit}
              onSave={handleUpdateColumnTitle}
              onCancel={() => setIsEditingTitle(false)}
              className={`font-black text-[16px] uppercase tracking-tighter truncate ${config.text}`}
            />
            <div className="bg-white/60 px-3 py-0.5 rounded-full text-[10px] font-black shadow-sm border border-white/20">
              {column.cards?.length || 0}
            </div>
          </div>
        </div>
        {!isEditingTitle && menuOptions.length > 0 && (
          <div className="hover:scale-110 transition-transform">
            <DropdownMenu options={menuOptions} />
          </div>
        )}
      </header>

      {/* CONTENEDOR DE TARJETAS ADAPTABLE */}
      <DroppableWrapper 
        id={column.id} 
        className="overflow-y-auto overflow-x-visible px-1 custom-scrollbar scroll-smooth"
      >
        <div className="space-y-4 pb-2 min-h-[10px]">
          <AnimatePresence initial={false} mode="popLayout">
            {column.cards?.map((card, cardIndex) => (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 1
                }}
              >
                <CardItem 
                  card={card} 
                  index={cardIndex}
                  isColumnDone={config.isDone}
                  board={board}
                  onDelete={canDelete ? () => handleDeleteCard(card.id) : undefined}
                  onUpdate={canEdit ? (p) => handleUpdateCard(card.id, p) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </DroppableWrapper>

      <footer className="mt-4 px-1 shrink-0">
        {isLoadingPermissions ? (
          <div className="w-full py-5 bg-white/20 animate-pulse rounded-[2rem]" />
        ) : canEdit ? (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isProcessing}
            className={`
              w-full py-4 border-2 rounded-[2.2rem] font-black text-[10px] 
              uppercase tracking-[0.15em] flex items-center justify-center gap-3 
              transition-all duration-300 active:scale-95 hover:shadow-lg
              ${config.button}
            `}
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={18} strokeWidth={3} />
            )}
            {isProcessing ? "Sincronizando..." : "Añadir Tarjeta"}
          </button>
        ) : (
          <div className="w-full py-4 bg-black/5 rounded-[2rem] border border-black/5 flex items-center justify-center gap-2 opacity-50">
            <Lock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Vista Protegida</span>
          </div>
        )}
      </footer>

      {isModalOpen && (
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