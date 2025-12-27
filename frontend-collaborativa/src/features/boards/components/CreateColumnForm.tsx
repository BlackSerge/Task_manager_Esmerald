// src/features/boards/components/CreateColumnForm.tsx
import React, { useState } from "react";
import { socketService } from "@/services/sockets";

interface Props {
  boardId: string;
}

export const CreateColumnForm: React.FC<Props> = ({ boardId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Enviamos la acción al backend vía Socket
    socketService.send({
      type: "column.create",
      payload: {
        title: title.trim(),
        board_id: boardId, // El backend ya lo tiene por la URL, pero lo enviamos por claridad
      },
    });

    setTitle("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-80 shrink-0 bg-emerald-600/10 hover:bg-emerald-600/20 border-2 border-dashed border-emerald-600/30 rounded-2xl p-4 flex items-center justify-center gap-2 text-emerald-700 font-bold transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Añadir otra columna
      </button>
    );
  }

  return (
    <div className="w-80 shrink-0 bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm animate-in fade-in zoom-in duration-200">
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre de la lista..."
          className="w-full px-3 py-2 border-2 border-emerald-100 rounded-xl focus:outline-none focus:border-emerald-500 text-emerald-950 font-medium placeholder:text-emerald-300"
        />
        <div className="flex items-center gap-2 mt-3">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Añadir lista
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="p-2 text-emerald-400 hover:text-emerald-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};