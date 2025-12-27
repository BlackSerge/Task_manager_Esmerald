// src/features/boards/pages/BoardsPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../hooks";
import { BoardCard } from "../components/BoardCard";
import { CreateBoardForm } from "../components/CreateBoardForm";
import { BoardSkeleton } from "../components/BoardSkeleton";

export const BoardsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: boards, isPending } = useBoards();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header con el Formulario Integrado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
        <div>
          <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">Mis Proyectos</h1>
          <p className="text-emerald-600/60 font-medium mt-1">Gestiona tus tableros de Trello estilo Emerald.</p>
        </div>
        <div className="w-full md:w-96">
          <CreateBoardForm />
        </div>
      </div>

      {/* Grid de Contenido */}
      {isPending ? (
        <BoardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards?.map((board) => (
            <BoardCard 
              key={board.id} 
              board={board} 
              onClick={() => navigate(`/boards/${board.id}`)} 
            />
          ))}

          {/* Estado vacío con estilo */}
          {boards?.length === 0 && (
            <div className="col-span-full py-20 bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-[3rem] text-center">
               <p className="text-emerald-800 font-black uppercase text-sm tracking-widest">No hay tableros todavía</p>
               <p className="text-emerald-600/60 text-sm mt-2 font-medium">Empieza creando uno arriba a la derecha.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};