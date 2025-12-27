// src/features/boards/components/ColumnList.tsx
import React from "react";
import { Column, Card } from "../types";
import { useDeleteList, useDeleteCard } from "../hooks";
import { CreateCardForm } from "./CreateCardForm";
import { EditableText } from "./EditableText";
import { DeleteIcon, CloseIcon } from "@/shared/components/icons";

interface Props {
  column: Column;
  boardId: string;
}

export const ColumnList: React.FC<Props> = ({ column, boardId }) => {
  const deleteListMutation = useDeleteList();
  const deleteCardMutation = useDeleteCard();

  const hasCards = column.cards && column.cards.length > 0;

  const handleDeleteColumn = () => {
    if (window.confirm(`¿Estás seguro de eliminar la lista "${column.title}"?`)) {
      deleteListMutation.mutate({ boardId, listId: String(column.id) });
    }
  };

  return (
    <div className="w-80 bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 flex-shrink-0 flex flex-col max-h-[88vh] border border-emerald-100 shadow-2xl shadow-emerald-900/5">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-5 px-2 group/list">
        <div className="flex-1 min-w-0"> {/* min-w-0 ayuda a que el texto largo no rompa el layout */}
          <h3 className="font-black text-emerald-900 text-sm uppercase tracking-widest flex items-center gap-2">
            <EditableText 
              initialValue={column.title}
              type="column.update"
              idKey="column_id"
              idValue={column.id}
              className="hover:text-emerald-600 transition-colors truncate"
            />
            {hasCards && (
              <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0">
                {column.cards.length}
              </span>
            )}
          </h3>
        </div>

        <button 
          onClick={handleDeleteColumn}
          className="opacity-0 group-hover/list:opacity-100 text-emerald-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-2xl ml-2 flex-shrink-0"
        >
          <DeleteIcon className="h-4 w-4" />
        </button>
      </div>
      
      {/* Contenedor de Tarjetas: 
          - Añadimos pt-2 para que el botón negativo de la primera tarjeta no se corte.
          - overflow-x-hidden para eliminar la barra horizontal que mencionas.
      */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-2 custom-scrollbar scroll-smooth">
        <div className="space-y-4 mb-4">
          {column.cards?.map((card: Card) => (
            <div 
              key={card.id} 
              className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-emerald-50 hover:border-emerald-300 hover:shadow-lg transition-all group relative"
            >
              <EditableText 
                initialValue={card.title}
                type="card.update"
                idKey="card_id"
                idValue={card.id}
                className="text-sm text-emerald-950 font-semibold leading-relaxed block"
              />
              
              {/* Botón de eliminar: 
                  Cambiamos de -top-2 a top-1 para evitar que se salga del contenedor padre y sea recortado por el overflow.
              */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCardMutation.mutate({ listId: String(column.id), cardId: String(card.id) });
                }}
                className="absolute top-1 -right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-all z-10 scale-90 hover:scale-110"
              >
                <CloseIcon className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="pb-2"> {/* Espaciado inferior para el formulario */}
          <CreateCardForm columnId={column.id} showPlaceholder={!hasCards} />
        </div>
      </div>
    </div>
  );
};