// src/features/boards/components/CreateColumnForm.tsx
import React, { useState } from "react";
import { useCreateList } from "../hooks";

export const CreateColumnForm: React.FC<{ boardId: string }> = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate({ boardId, title }, {
      onSuccess: () => {
        setTitle("");
        setIsEditing(false);
      }
    });
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="w-80 shrink-0 p-4 bg-emerald-600/10 border-2 border-dashed border-emerald-200 rounded-[2rem] text-emerald-700 font-black flex items-center justify-center gap-2 hover:bg-emerald-600/20 transition-all group"
      >
        <span className="text-xl group-hover:scale-125 transition-transform">+</span>
        Añadir otra lista
      </button>
    );
  }

  return (
    <div className="w-80 shrink-0 bg-white p-4 rounded-[2rem] border border-emerald-100 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          autoFocus
          placeholder="Nombre de la lista..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-900"
        />
        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-1 bg-emerald-600 text-white p-2 rounded-xl font-black text-sm hover:bg-emerald-700 transition-colors"
          >
            {isPending ? "..." : "Añadir lista"}
          </button>
          <button 
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-2 text-emerald-400 hover:text-emerald-600 font-bold"
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};