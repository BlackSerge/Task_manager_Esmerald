// src/features/boards/components/BoardCard.tsx
import React from "react";
import { Board } from "../types";

interface Props {
  board: Board;
  onClick: () => void;
}

export const BoardCard: React.FC<Props> = ({ board, onClick }) => {
  const count = board.columns?.length || 0;
  
  return (
    <div 
      onClick={onClick}
      className="group p-6 bg-white border border-emerald-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-900/10 hover:border-emerald-400 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[160px]"
    >
      <div>
        <h2 className="font-black text-xl text-emerald-900 group-hover:text-emerald-600 transition-colors tracking-tight">
          {board.title}
        </h2>
        <p className="text-emerald-400 text-xs font-bold uppercase mt-1 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          Abrir Proyecto →
        </p>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 uppercase">
          {count} {count === 1 ? 'columna' : 'columnas'}
        </span>
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>
  );
};