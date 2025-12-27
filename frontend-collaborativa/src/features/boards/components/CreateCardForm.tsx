import React, { useState } from "react";
import { useCreateCard} from "../hooks";

interface Props {
  listId: string;
}

export const CreateCardForm: React.FC<Props> = ({ listId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateCard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    mutate({ listId, title }, {
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
        className="w-full text-left p-2 text-gray-600 hover:bg-gray-200 rounded-md text-sm transition-colors"
      >
        + Añadir una tarjeta
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-2 rounded-md shadow-sm border border-blue-300">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Introduce un título para esta tarjeta..."
        className="w-full text-sm p-1 outline-none resize-none"
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
      />
      <div className="flex items-center gap-2 mt-2">
        <button 
          disabled={isPending}
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
        >
          {isPending ? "Añadiendo..." : "Añadir tarjeta"}
        </button>
        <button 
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};