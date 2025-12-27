// src/features/boards/pages/BoardDetailPage.tsx
import React, { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBoardsStore } from "@/store/boardsStore";
import { useSocketSync } from "@/hooks/useSocketSync";
import { CreateColumnForm } from "../components/CreateColumnForm";
import { ColumnList } from "../components/ColumnList";


export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  // 1. Sincronización
  useSocketSync(boardId);

  // 2. Selectores individuales (Esto evita el bucle infinito)
  const boards = useBoardsStore((state) => state.boards);
  const isLoading = useBoardsStore((state) => state.isLoading);

  // 3. Memorizamos el board buscado para mayor eficiencia
  const board = useMemo(() => 
    boards.find((b) => Number(b.id) === Number(boardId)),
    [boards, boardId]
  );

  // Spinner de carga inicial
  if (isLoading && !board) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-emerald-50/20">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-emerald-900 font-black uppercase tracking-widest text-xs animate-pulse">
          Sincronizando tablero...
        </p>
      </div>
    );
  }

  // Manejo de error si no existe
  if (!board) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl font-black text-emerald-950">Tablero no encontrado</h1>
        <button 
          onClick={() => navigate("/boards")}
          className="mt-4 text-emerald-600 font-bold hover:underline"
        >
          Volver a mis tableros
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-emerald-50/5">
      <header className="bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/boards" className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight">{board.title}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">En vivo</span>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto p-6 flex gap-6 items-start scrollbar-thin scrollbar-thumb-emerald-200">
        {board.columns?.map((column) => (
          <ColumnList key={column.id} column={column} boardId={String(board.id)} />
        ))}
        <div className="w-80 shrink-0">
          <CreateColumnForm boardId={String(board.id)} />
        </div>
      </main>
    </div>
  );
};