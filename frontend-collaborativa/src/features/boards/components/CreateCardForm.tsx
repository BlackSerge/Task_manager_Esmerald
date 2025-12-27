// src/features/boards/components/CreateCardForm.tsx
import React, { useState } from "react";
import { socketService } from "@/services/sockets";

interface Props {
  columnId: number | string;
  showPlaceholder?: boolean;
}

export const CreateCardForm: React.FC<Props> = ({ columnId, showPlaceholder = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setIsEditing(false);
      return;
    }

    // Enviamos la acción al servidor mediante el Socket Service
    // Usamos el payload que espera el backend según tus consumers.py
    socketService.send({
      type: "card.create",
      payload: {
        column_id: columnId,
        title: trimmedTitle,
      },
    });

    // Limpiamos el estado para la siguiente tarjeta
    setTitle("");
    setIsEditing(false);
  };

  // Estado: No editando (Mostramos botón o Placeholder)
  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={`w-full flex items-center justify-center gap-2 transition-all font-bold text-sm rounded-2xl group ${
          showPlaceholder
            ? "py-8 border-2 border-dashed border-emerald-100 text-emerald-300 hover:border-emerald-400 hover:text-emerald-600 bg-emerald-50/20"
            : "p-2 text-emerald-600 hover:bg-emerald-100/50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform group-hover:scale-110`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        {showPlaceholder ? "Añadir la primera tarjeta" : "Añadir una tarjeta"}
      </button>
    );
  }

  // Estado: Editando (Mostramos Formulario)
  return (
    <form 
      onSubmit={handleSubmit} 
      className="animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Escribe un título para esta tarjeta..."
        className="w-full p-3 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:border-emerald-500 text-sm resize-none shadow-sm text-emerald-950 placeholder:text-emerald-300 bg-white"
        rows={3}
        onKeyDown={(e) => {
          // Guardar con Enter (sin Shift)
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          // Cancelar con Escape
          if (e.key === "Escape") {
            setIsEditing(false);
            setTitle("");
          }
        }}
      />
      
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-xs hover:bg-emerald-700 transition-all shadow-md active:scale-95 uppercase tracking-wider"
        >
          Guardar Tarjeta
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setTitle("");
          }}
          className="p-2 text-emerald-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};