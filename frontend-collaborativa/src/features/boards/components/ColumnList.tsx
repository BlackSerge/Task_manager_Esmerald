// src/features/boards/components/ColumnList.tsx
import React from "react";
import { Column, Card } from "../types";
import { useDeleteList, useDeleteCard } from "../hooks";
import { CreateCardForm } from "./CreateCardForm";

interface Props {
  column: Column;
  boardId: string;
}

export const ColumnList: React.FC<Props> = ({ column, boardId }) => {
  const deleteListMutation = useDeleteList();
  const deleteCardMutation = useDeleteCard();

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la lista "${column.title}"?`)) {
      deleteListMutation.mutate({ boardId, listId: String(column.id) });
    }
  };

  return (
    <div className="w-80 bg-white/60 backdrop-blur-md rounded-[2rem] p-4 flex-shrink-0 flex flex-col max-h-full border border-emerald-100 shadow-xl shadow-emerald-900/5">
      {/* Header de la Columna */}
      <div className="flex justify-between items-center mb-4 px-2 group/list">
        <h3 className="font-black text-emerald-900 text-sm uppercase tracking-wider">
          {column.title}
        </h3>
        <button 
          onClick={handleDelete}
          className="opacity-0 group-hover/list:opacity-100 text-emerald-300 hover:text-red-500 transition-all p-1.5 hover:bg-red-50 rounded-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Contenedor de Tarjetas */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1 custom-scrollbar">
        {column.cards.map((card: Card) => (
          <div 
            key={card.id} 
            className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group relative"
          >
            <p className="text-sm text-emerald-950 font-medium leading-relaxed pr-6">{card.title}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                deleteCardMutation.mutate({ listId: String(column.id), cardId: String(card.id) });
              }}
              className="absolute top-4 right-3 opacity-0 group-hover:opacity-100 text-emerald-200 hover:text-red-400 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <CreateCardForm listId={String(column.id)} />
    </div>
  );
};