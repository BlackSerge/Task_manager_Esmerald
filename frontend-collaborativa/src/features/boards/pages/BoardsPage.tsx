// features/boards/pages/BoardsPage.tsx
import React from "react";
import { LayoutGrid, FolderOpen, Search, X, AlertCircle } from "lucide-react"; 
import { BoardCard } from "../components/Board/BoardCard";
import { CreateBoardForm } from "../components/Board/CreateBoardForm";
import { BoardListSkeleton } from "../components/Board/BoardListSkeleton";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";
import { useBoardsPageManager } from "../hooks/useBoardsPageManager";

export const BoardsPage: React.FC = () => {
  const {
    filteredBoards,
    searchTerm,
    setSearchTerm,
    boardToDelete,
    setBoardToDelete,
    showSkeleton,
    showError,
    isDeleting,
    handleBoardClick,
    handleEditTitle,
    handleDeleteConfirm,
    refetch
  } = useBoardsPageManager();

  if (showError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 md:p-10">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-emerald-950 mb-2">Error al cargar tableros</h2>
        <p className="text-emerald-600/60 mb-8 max-w-sm text-sm md:text-base">No pudimos conectar con el servidor. Revisa tu conexión.</p>
        <button 
          onClick={() => refetch()} 
          className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
        >
          Reintentar ahora
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 animate-in fade-in duration-500">
      {/* HEADER RESPONSIVO */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between mb-10 md:mb-14 gap-8">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <LayoutGrid className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-emerald-950 tracking-tighter">
                Mis Proyectos
              </h1>
            </div>
            {/* Eliminamos el margen izquierdo forzado en móvil para ganar espacio */}
            <p className="text-emerald-600/60 font-medium md:ml-12 text-sm md:text-base">
              Gestiona tus tableros de Trello estilo Emerald.
            </p>
          </div>

          {/* SEARCH BAR - Ajustada para ocupar todo el ancho en móvil */}
          <div className="relative w-full md:max-w-md group md:ml-12">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" 
              size={18} 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full pl-12 pr-10 py-3.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-emerald-950 font-bold placeholder:text-emerald-300 transition-all shadow-sm text-sm md:text-base"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-red-500 p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* FORMULARIO: Se apila abajo en móvil y se alinea a la derecha en desktop */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <CreateBoardForm />
        </div>
      </header>

      {showSkeleton ? (
        <BoardListSkeleton />
      ) : (
        /* GRID: 1 columna en móviles muy pequeños, 2 en tablets, 3+ en desktop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onClick={() => handleBoardClick(board.id)}
              onEdit={handleEditTitle}
              onDelete={(id) => setBoardToDelete({ id, title: board.title })}
            />
          ))}

          {/* EMPTY STATE RESPONSIVO */}
          {filteredBoards.length === 0 && (
            <div className="col-span-full py-16 md:py-24 bg-emerald-50/30 border-2 border-dashed border-emerald-200 rounded-[2rem] md:rounded-[3rem] text-center flex flex-col items-center px-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                <FolderOpen className="w-10 h-10 text-emerald-200" />
              </div>
              <p className="text-emerald-800 font-black uppercase text-xs md:text-sm tracking-widest">
                {searchTerm ? "Sin resultados" : "No hay tableros"}
              </p>
              <p className="text-emerald-600/60 text-sm mt-2 font-medium max-w-xs">
                {searchTerm 
                  ? `No encontramos nada que coincida con "${searchTerm}"` 
                  : "Empieza creando un tablero para organizar tus tareas."}
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!boardToDelete}
        title="¿Eliminar tablero?"
        description={`Estás a punto de eliminar "${boardToDelete?.title}". Esta acción borrará todas las columnas y tarjetas permanentemente.`}
        confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar tablero"}
        variant="danger"
        onClose={() => setBoardToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};