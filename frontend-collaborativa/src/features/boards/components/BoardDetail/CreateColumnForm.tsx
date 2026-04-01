import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Loader2, LayoutPanelLeft } from "lucide-react";
import { useCreateColumn } from "../../hooks/useBoards";

export const CreateColumnForm: React.FC<{ boardId: string }> = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateColumn();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEditing(false);
    };
    if (isEditing) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || isPending) return;

    mutate(
      { boardId: Number(boardId), title: cleanTitle },
      {
        onSuccess: () => {
          setTitle("");
          setIsEditing(false);
        },
      }
    );
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-80 shrink-0 h-20 bg-emerald-50/50 border-2 border-dashed border-emerald-200/60 
                   rounded-[2rem] p-6 text-emerald-600 font-black uppercase text-[11px] tracking-widest
                   hover:bg-emerald-500 hover:text-white hover:border-emerald-500 
                   hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-300 
                   flex items-center justify-center gap-3 group"
      >
        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        Añadir Columna
      </button>
    );
  }

  return (
    <div className="w-80 shrink-0 bg-white border border-emerald-100 rounded-[2.5rem] p-6 
                    shadow-2xl shadow-emerald-900/5 animate-in fade-in slide-in-from-right-4 duration-300">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <LayoutPanelLeft size={16} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-800/40">
            Nueva Lista
          </span>
        </div>

        <input
          ref={inputRef}
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre de la lista..."
          className="w-full px-5 py-4 bg-emerald-50/50 border-2 border-transparent 
                     rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 
                     focus:ring-emerald-500/5 outline-none font-bold text-emerald-950 
                     placeholder:text-emerald-300 transition-all"
          disabled={isPending}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!title.trim() || isPending}
            className="flex-[2] bg-emerald-600 text-white py-3 rounded-xl font-black 
                       uppercase text-[11px] tracking-widest flex items-center justify-center 
                       hover:bg-emerald-700 active:scale-95 disabled:bg-emerald-100 
                       disabled:text-emerald-300 transition-all shadow-lg shadow-emerald-200"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : "Crear Lista"}
          </button>
          
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 text-emerald-400 font-bold hover:text-red-500 
                       hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};