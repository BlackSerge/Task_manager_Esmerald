// features/boards/pages/BoardDetailPage.tsx
import React from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/shared/layout/components/Navbar";
import { CreateColumnForm } from "../components/BoardDetail/CreateColumnForm";
import { ColumnList } from "../components/BoardDetail/ColumnList";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { BoardDetailSkeleton } from "../components/BoardDetail/BoardDetailSkeleton";
import { useBoardDetailPageManager } from "../hooks/useBoardDetailPageManager";
import { Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05, when: "beforeChildren" } 
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export const BoardDetailPage: React.FC = () => {
  const {
    board,
    boardId,
    isChatOpen,
    closeChat,
    isError,
    showSkeleton,
    showNotFound,
    showSyncing,
    handleDragEnd,
    refetch
  } = useBoardDetailPageManager();

  if (showSkeleton) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f8fafc]">
        <Navbar />
        <BoardDetailSkeleton />
      </div>
    );
  }

  if (showNotFound || (!board && !showSkeleton)) {
    return (
      <div className="h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <h2 className="text-xl md:text-2xl font-black text-emerald-950/20 uppercase tracking-[0.3em] text-center">
            Tablero no encontrado
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      <Navbar />

      {/* SYNC INDICATOR - Optimizado para no estorbar en móvil */}
      <AnimatePresence>
        {(showSyncing || isError) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 z-[200] flex justify-center pointer-events-none"
          >
            <div className={`
              mt-4 flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-xl pointer-events-auto
              ${isError ? "bg-red-50/90 border-red-200" : "bg-white/90 border-emerald-100"}
            `}>
              <div className="relative flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${isError ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isError ? "text-red-700" : "text-emerald-800"}`}>
                {isError ? "Error de sincronización" : "Guardando cambios..."}
              </span>
              {isError && (
                <button onClick={() => refetch()} className="p-1 hover:bg-red-100 rounded-lg text-red-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 h-full overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            {/* CONTENEDOR DE COLUMNAS (THE MAGIC PART):
                1. snap-x snap-mandatory: Permite que las columnas se "peguen" al centro al hacer scroll en móvil.
                2. touch-pan-x: Evita que el scroll vertical del navegador interfiera con el arrastre.
                3. flex-nowrap: Obliga a las columnas a estar en una sola fila horizontal.
            */}
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="visible"
              className="h-full overflow-x-auto flex flex-nowrap items-start p-4 md:p-10 gap-4 md:gap-8 
                         snap-x snap-mandatory scroll-smooth custom-scrollbar touch-pan-x"
            >
              {board?.columns.map((column, idx) => (
                <motion.div 
                  key={`col-${column.id}`} 
                  variants={columnVariants} 
                  layout 
                  className="h-full shrink-0 w-[85vw] xs:w-[320px] md:w-80 snap-center"
                >
                  <ColumnList 
                    column={column} 
                    board={board} 
                    index={idx} 
                    totalColumns={board.columns.length} 
                  />
                </motion.div>
              ))}
              
              {/* Espacio para crear nueva columna */}
              <motion.div 
                variants={columnVariants} 
                className="shrink-0 w-[85vw] xs:w-[320px] md:w-80 pr-10 snap-center"
              >
                <CreateColumnForm boardId={String(boardId)} />
              </motion.div>
            </motion.div>
          </DragDropContext>
        </main>

        {/* OVERLAY DEL CHAT PARA MÓVIL */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-20 bg-emerald-950/40 backdrop-blur-sm z-[140]" 
              onClick={closeChat} 
            />
          )}
        </AnimatePresence>

        {/* CHAT PANEL: w-full en móvil para UX nativa */}
        <aside className={`
            fixed top-20 right-0 bottom-0 z-[150] w-full md:w-[450px] bg-white 
            shadow-[-20px_0_60px_rgba(6,78,59,0.15)] md:rounded-tl-[4.5rem] 
            transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            ${isChatOpen ? "translate-x-0" : "translate-x-full"}
        `}>
          <div className="flex flex-col h-full w-full bg-white">
            {isChatOpen && <ChatPanel boardId={String(boardId)} />}
          </div>
        </aside>
      </div>
    </div>
  );
};