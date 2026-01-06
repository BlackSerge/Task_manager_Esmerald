import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { Loader2 } from "lucide-react";
import { motion, Variants } from "framer-motion";

import { Navbar } from "@/shared/layout/components/Navbar";
import { useNavBarStore } from "@/shared/components/stores/navbar.store";
import { useBoardsStore } from "@/features/boards/store/board.store";
import { useSocketSync } from "@/features/boards/hooks/useSocketSync";
import { useBoardDetail } from "../hooks/useBoards";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { CreateColumnForm } from "../components/BoardDetail/CreateColumnForm";
import { ColumnList } from "../components/BoardDetail/ColumnList";
import { ChatPanel } from "@/features/chat/components/ChatPanel";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export const BoardDetailPage: React.FC = () => {
  // 1. HOOKS DE RUTAS Y UI
  const { boardId } = useParams<{ boardId: string }>();
  const { isChatOpen, closeChat } = useNavBarStore();

  // 2. HOOKS DE DATOS (Se ejecutan siempre primero)
  const { isLoading: isQueryLoading, data: boardData } = useBoardDetail(boardId);
  useSocketSync(boardId);

  // 3. SELECTORES DE STORE (Ubicados aquí para evitar el error de llamada condicional)
  const boardFromStore = useBoardsStore((state) =>
    state.boards.find((b) => String(b.id) === String(boardId))
  );
  const isStoreLoading = useBoardsStore((state) => state.isLoading);
  
  // 4. LÓGICA DE DND
  const { handleDragEnd } = useBoardDragAndDrop(boardId);

  // 5. DETERMINAR FUENTE DE VERDAD
  const board = boardData || boardFromStore;

  // 6. EFECTOS DE MONITOREO
  useEffect(() => {
    if (board) {
      console.group(`📊 [BOARD SYNC] - ID: ${board.id}`);
      console.log("Métricas:", {
        total: board.total_cards,
        completed: board.completed_cards,
        progress: `${board.progress_percentage}%`
      });
      console.groupEnd();
    }
  }, [board]);

  // --- RENDERING CONDICIONAL (Después de todos los hooks) ---

  // UI: Pantalla de Carga
  if (!board && (isQueryLoading || isStoreLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
             <Loader2 className="w-12 h-12 text-emerald-500 animate-spin absolute" />
             <div className="w-16 h-16 border-4 border-emerald-50 rounded-full"></div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800 animate-pulse">
            Sincronizando Entorno...
          </p>
        </div>
      </div>
    );
  }

  // UI: Error 404
  if (!board) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-emerald-50 text-center max-w-sm">
          <h1 className="text-6xl font-black text-emerald-950 mb-4">404</h1>
          <p className="font-bold text-emerald-700 uppercase tracking-widest text-xs mb-6">
            El tablero ha desaparecido de la red
          </p>
          <button 
             onClick={() => window.location.href = '/'}
             className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // UI: Contenido Principal
  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden">
      <Navbar />

      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 h-full overflow-hidden">
          <DragDropContext onDragEnd={handleDragEnd}>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="h-full overflow-x-auto p-10 flex gap-8 items-start custom-scrollbar"
            >
              {board.columns?.map((column, idx) => (
                <motion.div 
                  key={`col-${column.id}`} 
                  variants={columnVariants}
                  layout 
                  className="h-full"
                >
                  <ColumnList
                    column={column}
                    board={board}
                    index={idx}
                    totalColumns={board.columns.length}
                  />
                </motion.div>
              ))}
              
              <motion.div variants={columnVariants} className="w-80 shrink-0 pr-20">
                <CreateColumnForm boardId={String(board.id)} />
              </motion.div>
            </motion.div>
          </DragDropContext>
        </main>

        {/* Overlay del Chat */}
        {isChatOpen && (
          <div
            className="fixed inset-0 top-20 bg-emerald-950/20 backdrop-blur-sm z-[140] transition-all"
            onClick={closeChat}
          />
        )}

        {/* Panel Lateral del Chat */}
        <aside
          className={`
            fixed top-20 right-0 bottom-0 z-[150]
            w-[360px] md:w-[450px]
            bg-white shadow-[-20px_0_60px_rgba(6,78,59,0.15)]
            rounded-tl-[4.5rem] 
            border-l border-emerald-100/50
            overflow-hidden 
            transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1)
            ${isChatOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          `}
        >
          <div className="flex flex-col h-full w-full bg-white">
            {isChatOpen && <ChatPanel boardId={String(board.id)} />}
          </div>
        </aside>
      </div>
    </div>
  );
};