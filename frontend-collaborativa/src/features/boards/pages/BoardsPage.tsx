// src/features/boards/pages/BoardsPage.tsx
import React, { useState, useMemo, useEffect } from "react"; // ✅ Añadido useEffect
import { useNavigate } from "react-router-dom";
import { LayoutGrid, FolderOpen, Search, X } from "lucide-react"; 
import { useBoards, useUpdateBoard, useDeleteBoard } from "../hooks/boardHooks";
import { useBoardsStore } from "../store/board.store"; 
import { BoardCard } from "../components/BoardCard";
import { CreateBoardForm } from "../components/CreateBoardForm";
import { BoardSkeleton } from "../components/BoardSkeleton";
import { ConfirmModal } from "@/shared/components/ui/ConfirmModal";

export const BoardsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. Iniciamos la carga de datos con el hook de React Query
  const { data: boardsData, isPending: isLoadingQuery } = useBoards();
  
  // 2. Consumimos los datos y la acción de setBoards del Store
  const boards = useBoardsStore((state) => state.boards);
  const setBoards = useBoardsStore((state) => state.setBoards);

  // 💡 SINCRONIZACIÓN CRUCIAL: 
  // Si React Query obtiene datos, los guardamos en el Store global inmediatamente.
  useEffect(() => {
    if (boardsData) {
      setBoards(boardsData);
    }
  }, [boardsData, setBoards]);
  
  const deleteMutation = useDeleteBoard();
  const updateMutation = useUpdateBoard();

  // --- LÓGICA DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [boardToDelete, setBoardToDelete] = useState<{ id: string; title: string } | null>(null);

  // Filtramos usando el array del Store (que ahora se actualiza vía useEffect)
  const filteredBoards = useMemo(() => {
    return boards.filter((board) =>
      board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [boards, searchTerm]);

  const handleBoardClick = (id: number | string): void => {
    navigate(`/boards/${id}`);
  };

  const handleEditTitle = (id: string, newTitle: string) => {
    if (newTitle && newTitle.trim() !== "") {
      updateMutation.mutate({ 
        id: Number(id), 
        title: newTitle.trim() 
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (boardToDelete) {
      deleteMutation.mutate(Number(boardToDelete.id), {
        onSuccess: () => setBoardToDelete(null)
      });
    }
  };

  // Combinamos estados de carga para evitar parpadeos
  // Si la query está cargando y no tenemos boards en el store, mostramos skeleton
  const isLoading = isLoadingQuery && boards.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="text-emerald-600 w-6 h-6" />
              <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">
                Mis Proyectos
              </h1>
            </div>
            <p className="text-emerald-600/60 font-medium ml-8">
              Gestiona tus tableros de Trello estilo Emerald.
            </p>
          </div>

          {/* 🔍 BARRA DE BÚSQUEDA INTEGRADA */}
          <div className="relative max-w-md group ml-8">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" 
              size={18} 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar proyecto..."
              className="w-full pl-12 pr-10 py-3.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white text-emerald-950 font-bold placeholder:text-emerald-300 transition-all shadow-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-96">
          <CreateBoardForm />
        </div>
      </header>

      {isLoading ? (
        <BoardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBoards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              onClick={() => handleBoardClick(board.id)}
              onEdit={handleEditTitle}
              onDelete={(id) => setBoardToDelete({ id, title: board.title })}
            />
          ))}

          {/* ESTADOS VACÍOS (Datos reales vs Búsqueda) */}
          {filteredBoards.length === 0 && (
            <div className="col-span-full py-20 bg-emerald-50/30 border-2 border-dashed border-emerald-200 rounded-[3rem] text-center flex flex-col items-center">
              <FolderOpen className="w-12 h-12 text-emerald-200 mb-4" />
              <p className="text-emerald-800 font-black uppercase text-sm tracking-widest">
                {searchTerm ? "Sin resultados" : "No hay tableros"}
              </p>
              <p className="text-emerald-600/60 text-sm mt-2 font-medium">
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
        confirmText={deleteMutation.isPending ? "Eliminando..." : "Sí, eliminar tablero"}
        variant="danger"
        onClose={() => setBoardToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};