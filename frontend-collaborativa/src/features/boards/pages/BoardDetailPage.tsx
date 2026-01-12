import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCcw, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { Navbar } from "@/shared/layout/components/Navbar";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { BoardDetailSkeleton } from "../components/BoardDetail/BoardDetailSkeleton";
import { ColumnList } from "../components/BoardDetail/ColumnList";
import { CreateColumnForm } from "../components/BoardDetail/CreateColumnForm";
import { useBoardDetailPageManager } from "../hooks/useBoardDetailPageManager";

export const BoardDetailPage: React.FC = () => {
  const [isOverviewMode, setIsOverviewMode] = useState(false);

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
    refetch,
  } = useBoardDetailPageManager();

  if (showSkeleton) return <BoardDetailSkeleton />;
  if (showNotFound || !board) return <NotFoundState />;

  const ZOOM_FACTOR = 0.65;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden select-none">
      <Navbar />

      <SyncStatusIndicator isSyncing={showSyncing} isError={isError} onRetry={refetch} />

      {/* CONTENEDOR DE SCROLL MAESTRO:
          - touch-pan-x: Habilita el gesto nativo de deslizamiento lateral.
          - overflow-x-auto: Permite el scroll.
          - custom-scrollbar: Para ocultar la barra en móviles pero mantener el gesto.
      */}
      <div className="flex-1 relative">
        <div 
          className={`
            absolute inset-0 overflow-x-auto overflow-y-hidden 
            touch-pan-x overscroll-x-contain custom-scrollbar
            ${isOverviewMode ? "bg-slate-100/40" : "snap-x snap-mandatory"}
          `}
        >
          <main className="h-full min-w-full">
            <DragDropContext onDragEnd={handleDragEnd}>
              <motion.div
                initial={false}
                animate={{
                  scale: isOverviewMode ? ZOOM_FACTOR : 1,
                  width: isOverviewMode ? `${100 / ZOOM_FACTOR}%` : "100%",
                  paddingTop: isOverviewMode ? "0px" : "0px", // Pegado absoluto
                }}
                transition={{ type: "spring", stiffness: 300, damping: 35 }}
                style={{ originX: 0, originY: 0 }}
                className="h-full flex items-stretch gap-4 px-6"
              >
                {board.columns.map((column, idx) => (
                  <div
                    key={column.id}
                    className={`
                      shrink-0 transition-all duration-500 py-4
                      ${isOverviewMode 
                        ? "w-[260px]" 
                        : "w-[85vw] sm:w-[320px] snap-center"
                      }
                    `}
                  >
                    <div className="h-full"> 
                      <ColumnList
                        column={column}
                        board={board}
                        index={idx}
                        totalColumns={board.columns.length}
                      />
                    </div>
                  </div>
                ))}

                <div className={`shrink-0 py-4 ${isOverviewMode ? "w-[260px] pr-80" : "w-[85vw] sm:w-[320px] snap-center pr-10"}`}>
                  <CreateColumnForm boardId={String(boardId)} />
                </div>
              </motion.div>
            </DragDropContext>
          </main>
        </div>

        {/* MÁSCARA DE GRADIENTE (Solo visual, no bloquea el touch) */}
        <AnimatePresence>
          {isOverviewMode && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[5] pointer-events-none shadow-[inset_40px_0_40px_-20px_#f8fafc,inset_-40px_0_40px_-20px_#f8fafc]"
            />
          )}
        </AnimatePresence>

        {/* BOTÓN DE ZOOM */}
        <motion.button
          layout
          onClick={() => setIsOverviewMode((prev) => !prev)}
          whileTap={{ scale: 0.9 }}
          className={`
            fixed bottom-8 right-6 z-[100]
            w-12 h-12 rounded-2xl shadow-2xl border backdrop-blur-md
            flex items-center justify-center transition-all duration-500
            ${isOverviewMode 
              ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/20" 
              : "bg-white/90 border-slate-200 text-slate-500"
            }
          `}
        >
          {isOverviewMode ? <ZoomIn size={20} /> : <ZoomOut size={20} />}
        </motion.button>
      </div>

      {/* PANEL DE CHAT */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 top-16 bg-black/20 backdrop-blur-[2px] z-[140]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 z-[150] w-[85vw] sm:w-[400px] bg-white shadow-2xl flex flex-col border-l border-slate-100"
            >
              <ChatPanel boardId={String(boardId)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===================== SUBCOMPONENTES ===================== */

const SyncStatusIndicator: React.FC<{
  isSyncing: boolean;
  isError: boolean;
  onRetry: () => void;
}> = ({ isSyncing, isError, onRetry }) => (
  <AnimatePresence>
    {(isSyncing || isError) && (
      <motion.div
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -20, x: "-50%" }}
        className="fixed top-24 left-1/2 z-[600] pointer-events-none"
      >
        <div className={`
          flex items-center gap-3 px-4 py-2 rounded-2xl border backdrop-blur-xl shadow-xl pointer-events-auto
          ${isError ? "bg-red-50 border-red-200 text-red-900" : "bg-white/90 border-emerald-100 text-emerald-900"}
        `}>
          {isError ? (
            <RefreshCcw className="w-4 h-4 text-red-500 animate-spin" />
          ) : (
            <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isError ? "Error" : "Syncing"}
          </span>
          {isError && (
            <button onClick={onRetry} className="bg-red-600 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase">
              Retry
            </button>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const NotFoundState: React.FC = () => (
  <div className="h-screen flex flex-col bg-[#f8fafc]">
    <Navbar />
    <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
        <Search className="text-emerald-500 w-10 h-10" />
      </div>
      <h2 className="text-xl font-black text-emerald-950 uppercase tracking-tighter mb-2">No encontrado</h2>
      <button 
        onClick={() => (window.location.href = "/")} 
        className="px-8 py-3 bg-emerald-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg"
      >
        Volver
      </button>
    </div>
  </div>
);