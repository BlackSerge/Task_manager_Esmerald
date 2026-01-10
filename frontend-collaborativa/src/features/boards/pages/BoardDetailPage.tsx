import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion, Variants, AnimatePresence } from "framer-motion";

import { Navbar } from "@/shared/layout/components/Navbar";
import { useNavBarStore } from "@/shared/components/stores/navbar.store";
import { useBoardsStore } from "@/features/boards/store/board.store";
import { useSocketSync } from "@/features/boards/hooks/useSocketSync";
import { useBoardDetail } from "../hooks/useBoards";
import { useBoardDragAndDrop } from "../hooks/useBoardDragAndDrop";
import { CreateColumnForm } from "../components/BoardDetail/CreateColumnForm";
import { ColumnList } from "../components/BoardDetail/ColumnList";
import { ChatPanel } from "@/features/chat/components/ChatPanel";
import { BoardDetailSkeleton } from "../components/BoardDetail/BoardDetailSkeleton";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      when: "beforeChildren" 
    },
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
  const { boardId } = useParams<{ boardId: string }>();
  const { isChatOpen, closeChat } = useNavBarStore();

  // 1. DATA FETCHING (Carga inicial vía Service Layer)
  // Mantenemos la query para obtener los datos si el usuario refresca la página
  const { isLoading: isQueryLoading, data: boardData } = useBoardDetail(boardId);
  
  // 2. SOCKET SYNC (Mantiene la conexión WebSocket activa)
  // Ahora es seguro porque useSocketSync usa una Ref interna para el handler
  useSocketSync(boardId);

  // 3. FUENTE DE VERDAD (Zustand)
  const board = useBoardsStore((state) =>
    state.boards.find((b) => String(b.id) === String(boardId))
  );
  
  const updateBoardStore = useBoardsStore((state) => state.updateBoard);

  // 4. HIDRATACIÓN DEFENSIVA
  useEffect(() => {
    /**
     * Solo hidratamos el store si:
     * 1. Tenemos datos de la API (boardData).
     * 2. El board NO existe aún en el store centralizado.
     * Esto evita que React Query sobreescriba cambios en tiempo real del Socket.
     */
    if (boardData && !board) {
      updateBoardStore(boardData);
    }
  }, [boardData, board, updateBoardStore]);

  // 5. LÓGICA DE DRAG & DROP
  const { handleDragEnd } = useBoardDragAndDrop(boardId);

  // 6. GESTIÓN DE ESTADOS DE CARGA
  // Si no hay board en store y la query está cargando, mostramos skeleton
  const showSkeleton = isQueryLoading && !board;

  if (showSkeleton) {
    return (
      <div className="fixed inset-0 flex flex-col bg-[#f8fafc]">
        <Navbar />
        <BoardDetailSkeleton />
      </div>
    );
  }

  // Si terminó la carga y el board no existe en ninguna parte, es error 404
  if (!board && !isQueryLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <Navbar />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-black text-emerald-950/20 uppercase tracking-[0.2em]">
            Tablero no encontrado
          </h2>
        </motion.div>
      </div>
    );
  }

  // 7. RENDERIZADO PRINCIPAL (Solo si 'board' existe en el Store)
  return (
    <div className="fixed inset-0 flex flex-col bg-[#f8fafc] overflow-hidden">
      <Navbar />

      <div className="flex-1 flex relative overflow-hidden">
        <main className="flex-1 h-full overflow-hidden">
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <DragDropContext onDragEnd={handleDragEnd}>
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="h-full overflow-x-auto p-10 flex gap-8 items-start custom-scrollbar"
              >
                {board?.columns?.map((column, idx) => (
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
                
                <motion.div 
                  variants={columnVariants} 
                  className="w-80 shrink-0 pr-20"
                >
                  <CreateColumnForm boardId={String(board?.id)} />
                </motion.div>
              </motion.div>
            </DragDropContext>
          </motion.div>
        </main>

        {/* Chat Components */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
            {isChatOpen && board && <ChatPanel boardId={String(board.id)} />}
          </div>
        </aside>
      </div>
    </div>
  );
};