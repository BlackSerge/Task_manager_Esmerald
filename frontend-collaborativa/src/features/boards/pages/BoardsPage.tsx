import React from "react";
import { LayoutGrid, FolderOpen, Search,  AlertCircle } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-black text-emerald-950">Error de carga</h2>
        <button onClick={() => refetch()} className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-12">
      
      {/* HEADER COMPACTO PARA MÓVIL */}
      <header className="flex flex-col lg:flex-row gap-6 mb-8 md:mb-14">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg md:rounded-xl">
              <LayoutGrid className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-emerald-950 tracking-tighter">
              Mis Proyectos
            </h1>
          </div>

          {/* Buscador estilizado */}
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full pl-11 pr-10 py-3 md:py-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium text-sm md:text-base"
            />
          </div>
        </div>

        <div className="w-full lg:w-80 xl:w-96">
          <CreateBoardForm />
        </div>
      </header>

      {showSkeleton ? (
        <BoardListSkeleton />
      ) : (
        /* GRID PRO: 
           - 'grid-cols-2': Forzamos 2 columnas desde el dispositivo más pequeño (UX Ágil).
           - 'gap-3 md:gap-6': Espaciado reducido en móvil para ganar aire.
        */
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredBoards.map((board) => (
              <motion.div
                key={board.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 35,
                  layout: { duration: 0.3 } 
                }}
              >
                <BoardCard
                  board={board}
                  onClick={() => handleBoardClick(board.id)}
                  onEdit={handleEditTitle}
                  onDelete={(id) => setBoardToDelete({ id, title: board.title })}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State adaptado */}
      {!showSkeleton && filteredBoards.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <FolderOpen className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
          <p className="text-emerald-800 font-bold text-sm uppercase tracking-widest">No hay resultados</p>
        </div>
      )}

      <ConfirmModal
        isOpen={!!boardToDelete}
        title="¿Eliminar?"
        description={`Borrarás "${boardToDelete?.title}"`}
        confirmText={isDeleting ? "..." : "Eliminar"}
        variant="danger"
        onClose={() => setBoardToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};