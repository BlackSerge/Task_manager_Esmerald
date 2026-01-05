// src/features/boards/components/CreateColumnForm.tsx
import React, { useState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useCreateColumn } from "../hooks/useBoards";

export const CreateColumnForm: React.FC<{ boardId: string }> = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateColumn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isPending) return;

    mutate({ boardId: Number(boardId), title: title.trim() }, {
      onSuccess: () => {
        setTitle("");
        setIsEditing(false);
      }
    });
  };

  if (!isEditing) {
    return (
      <button onClick={() => setIsEditing(true)} className="w-80 shrink-0 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-3xl p-6 text-emerald-600 font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
        <Plus size={20} /> Añadir Columna
      </button>
    );
  }

  return (
    <div className="w-80 shrink-0 bg-white border border-emerald-100 rounded-3xl p-5 shadow-xl animate-in fade-in zoom-in duration-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre de la lista..."
          className="w-full px-4 py-3 bg-emerald-50/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold"
          disabled={isPending}
        />
        <div className="flex gap-2">
          <button type="submit" disabled={isPending} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold flex items-center justify-center">
            {isPending ? <Loader2 className="animate-spin" size={18} /> : "Añadir"}
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="p-2 text-emerald-400">
            <X size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};