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
import { Variants} from "framer-motion";


const containerVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1, 
      when: "beforeChildren" as const 
    } 
  },
};


const columnVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.98 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } as const, 
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

  // ESTADO 1: SKELETON
  if (showSkeleton) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f8fafc]">
        <Navbar />
        <BoardDetailSkeleton />
      </div>
    );
  }

  // ESTADO 2: ERROR
  if (isError && !board) {
    return (
      <div className="h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <div className="mb-6 p-6 bg-red-50 rounded-full inline-block text-red-500">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
            <h2 className="text-3xl font-black text-emerald-950 mb-2">Error de conexión</h2>
            <button onClick={() => refetch()} className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-700 transition-all">
              Reintentar
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ESTADO 3: 404
  if (showNotFound) {
    return (
      <div className="h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-2xl font-black text-emerald-950/20 uppercase tracking-[0.3em]">Tablero no encontrado</h2>
        </div>
      </div>
    );
  }

  
  if (!board) return null;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden">
      <Navbar />

     <AnimatePresence mode="wait">
  {(showSyncing || isError) && (
    <motion.div 
      key={isError ? "sync-error" : "sync-active"}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="absolute top-24 right-10 z-[200]"
    >
      <div className={`
        flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-md shadow-xl transition-colors duration-500
        ${isError 
          ? "bg-red-50/90 border-red-200 shadow-red-900/5" 
          : "bg-white/90 border-emerald-100 shadow-emerald-900/5"}
      `}>
      
        <div className="relative flex items-center justify-center">
          <div className={`w-2 h-2 rounded-full ${isError ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`} />
          {!isError && (
            <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
          )}
        </div>

        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isError ? "text-red-700" : "text-emerald-800"}`}>
            {isError ? "Error de Conexión" : "Sincronizando"}
          </span>
          {isError && (
            <span className="text-[9px] font-bold text-red-500/80 -mt-0.5">
              Los cambios no se guardaron
            </span>
          )}
        </div>

        {isError && (
          <button 
            onClick={() => refetch()}
            className="ml-2 p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            title="Reintentar sincronización"
          >
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              <motion.div 
                variants={containerVariants} initial="hidden" animate="visible"
                className="h-full overflow-x-auto p-10 flex gap-8 items-start custom-scrollbar"
              >
                {board.columns.map((column, idx) => (
                  <motion.div key={`col-${column.id}`} variants={columnVariants} layout className="h-full">
                    <ColumnList column={column} board={board} index={idx} totalColumns={board.columns.length} />
                  </motion.div>
                ))}
                
                <motion.div variants={columnVariants} className="w-80 shrink-0 pr-20">
                  <CreateColumnForm boardId={String(boardId)} />
                </motion.div>
              </motion.div>
            </DragDropContext>
          </motion.div>
        </main>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 top-20 bg-emerald-950/20 backdrop-blur-sm z-[140]" 
              onClick={closeChat} 
            />
          )}
        </AnimatePresence>

        <aside className={`
            fixed top-20 right-0 bottom-0 z-[150] w-[360px] md:w-[450px] bg-white 
            shadow-[-20px_0_60px_rgba(6,78,59,0.15)] rounded-tl-[4.5rem] 
            transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
            ${isChatOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        `}>
          <div className="flex flex-col h-full w-full bg-white">
            {isChatOpen && <ChatPanel boardId={String(boardId)} />}
          </div>
        </aside>
      </div>
    </div>
  );
};