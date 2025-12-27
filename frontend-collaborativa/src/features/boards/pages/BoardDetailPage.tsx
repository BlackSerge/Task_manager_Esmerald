// src/features/boards/pages/BoardDetailPage.tsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBoardsStore } from "@/store/boardsStore";
import { useSocketSync } from "@/hooks/useSocketSync";
import { CreateColumnForm } from "../components/CreateColumnForm";
import { ColumnList } from "../components/ColumnList";

export const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  // 1. Sincronización en tiempo real vía WebSockets
  useSocketSync(boardId);

  /** * 2. Selección de estado profesional:
   * Extraemos el board y el estado de carga. 
   * Usamos Number(boardId) para asegurar compatibilidad de tipos.
   */
  const { board, isLoading } = useBoardsStore((state) => ({
    board: state.boards.find((b) => Number(b.id) === Number(boardId)),
    isLoading: state.isLoading
  }));

  /**
   * 3. Lógica de renderizado condicional:
   * Si el store dice que está cargando O el tablero aún no está en el array,
   * mantenemos el spinner. En cuanto el socket ejecute 'updateBoard', 
   * isLoading pasará a false y board dejará de ser undefined.
   */
  if (isLoading && !board) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-emerald-50/20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-emerald-100 rounded-full" />
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
        </div>
        <p className="mt-6 text-emerald-900 font-black uppercase tracking-widest text-xs animate-pulse">
          Sincronizando con el servidor...
        </p>
      </div>
    );
  }

  // Si después de cargar, el tablero realmente no existe
  if (!board) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
        <h2 className="text-2xl font-black text-emerald-950 mb-2">Tablero no encontrado</h2>
        <p className="text-emerald-600/70 mb-6 font-medium">Parece que este tablero no existe o no tienes acceso.</p>
        <button 
          onClick={() => navigate("/boards")}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
        >
          Volver a mis tableros
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-emerald-50/5">
      {/* Header del Tablero */}
      <header className="bg-white border-b border-emerald-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            to="/boards" 
            className="p-2 hover:bg-emerald-50 rounded-xl text-emerald-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight leading-none">
              {board.title}
            </h1>
            <span className="text-[10px] text-emerald-600/50 font-bold uppercase tracking-tighter">
              Proyecto ID: {board.id}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync</span>
        </div>
      </header>

      {/* Área de Trabajo (Canvas) */}
      <main className="flex-1 overflow-x-auto p-6 flex gap-6 items-start scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-transparent">
        {board.columns?.map((column) => (
          <ColumnList key={column.id} column={column} boardId={String(board.id)} />
        ))}

        {/* Formulario para añadir nueva lista */}
        <div className="w-80 shrink-0">
          <CreateColumnForm boardId={String(board.id)} />
        </div>
      </main>
    </div>
  );
};