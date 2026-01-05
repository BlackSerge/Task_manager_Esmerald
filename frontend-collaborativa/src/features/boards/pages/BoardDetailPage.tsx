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
import { CreateColumnForm } from "../components/CreateColumnForm";
import { ColumnList } from "../components/ColumnList";
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
  const { boardId } = useParams<{ boardId: string }>();
  const { isChatOpen, closeChat } = useNavBarStore();

  // 1. Sincronización de Datos (HTTP + WebSocket)
  const { isLoading: isQueryLoading } = useBoardDetail(boardId);
  useSocketSync(boardId);

  // 2. Selector del Store
  const board = useBoardsStore((state) =>
    state.boards.find((b) => String(b.id) === String(boardId))
  );
  
  const isStoreLoading = useBoardsStore((state) => state.isLoading);
  const { handleDragEnd } = useBoardDragAndDrop(Number(boardId));

  // 3. Monitor de Integridad (Crucial para ver por qué no eres admin)
  useEffect(() => {
    if (board) {
      console.group(`📊 [BOARD DATA CHECK] - Tablero: ${board.id}`);
      console.log("Owner Data:", board.owner);
      console.log("Owner ID (normalized):", board.owner_id);
      console.log("Members Count:", board.members?.length);
      console.groupEnd();
    }
  }, [board]);

  // Pantalla de Carga
  if (!board && (isQueryLoading || isStoreLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800 animate-pulse">
            Sincronizando Tablero...
          </p>
        </div>
      </div>
    );
  }

  // Error 404 local
  if (!board) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <h1 className="text-4xl font-black text-emerald-900 mb-2">404</h1>
          <p className="font-bold text-emerald-700 uppercase tracking-tighter">Tablero no encontrado</p>
        </div>
      </div>
    );
  }

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
              {/* Iteramos sobre las columnas */}
              {board.columns?.map((column, idx) => (
                <motion.div 
                  key={`col-${column.id}`} 
                  variants={columnVariants}
                  layout 
                  className="h-full"
                >
                  <ColumnList
                    column={column}
                    board={board} // Pasamos el objeto board completo para usePermissions
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

        {/* Chat Overlay */}
        {isChatOpen && (
          <div
            className="fixed inset-0 top-20 bg-emerald-950/10 backdrop-blur-[1px] z-[140]"
            onClick={closeChat}
          />
        )}

        {/* Side Panel (Chat) */}
        <aside
          className={`
            fixed top-20 right-0 bottom-0 z-[150]
            w-[360px] md:w-[450px]
            bg-white shadow-[-15px_0_50px_rgba(6,78,59,0.12)]
            rounded-tl-[4.5rem] 
            border-l border-t border-emerald-100/50
            overflow-hidden 
            transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
            ${isChatOpen ? "translate-x-0" : "translate-x-full"}
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