import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateBoard, boardKeys } from "../hooks/useBoards"; // ✅ Importación corregida

export const CreateBoardForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateBoard();

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    
    if (!trimmedTitle || isPending) return;

    mutate(trimmedTitle, { 
      onSuccess: () => {
        setTitle("");
        // ✅ Sincronización perfecta:
        // Invalidamos 'all' para que cualquier componente que escuche tableros se actualice
        queryClient.invalidateQueries({ queryKey: boardKeys.all });
      },
      onError: (error) => {
        console.error("Error al crear el tablero:", error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
      <div className="relative flex-1 group">
        <input
          type="text"
          placeholder="Nombre del nuevo proyecto (ej: Marketing 2026)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          className="w-full p-4 px-6 bg-white border-2 border-emerald-50 rounded-[1.5rem] 
                     focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none 
                     shadow-sm placeholder:text-emerald-200 text-emerald-900 font-bold 
                     transition-all disabled:opacity-50 disabled:bg-emerald-50/30"
        />
        <div className="absolute inset-0 rounded-[1.5rem] border-2 border-transparent 
                        group-focus-within:border-emerald-500/20 pointer-events-none" />
      </div>
      
      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[1.5rem] 
                   font-black transition-all hover:shadow-emerald-900/20 active:scale-95 
                   disabled:opacity-50 disabled:grayscale shadow-xl shadow-emerald-200 
                   flex items-center justify-center gap-2 h-[60px] sm:h-auto min-w-[140px]"
      >
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Plus size={20} strokeWidth={3} />
            <span>Crear Tablero</span>
          </>
        )}
      </button>
    </form>
  );
};