// src/features/boards/components/CreateBoardForm.tsx
import React, { useState } from "react";
import { useCreateBoard } from "../hooks";

export const CreateBoardForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateBoard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate(title, { 
    onSuccess: () => setTitle("") 
  });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Nuevo tablero..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 p-3 px-5 bg-white border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm placeholder:text-gray-400 text-emerald-900 font-medium"
      />
      <button
        type="submit"
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-200"
      >
        {isPending ? "..." : "Crear"}
      </button>
    </form>
  );
};