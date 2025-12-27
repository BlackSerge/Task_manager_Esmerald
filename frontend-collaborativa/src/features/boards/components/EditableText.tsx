// src/features/boards/components/EditableText.tsx
import React, { useState, useEffect, useRef } from "react";
import { socketService } from "@/services/sockets";
import { EditIcon, CheckIcon, CloseIcon } from "@/shared/components/icons";
import { EditableTextProps } from "../types";

export const EditableText: React.FC<EditableTextProps> = ({ 
  initialValue, 
  type, 
  idKey, 
  idValue, 
  className 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== initialValue) {
      socketService.send({
        type,
        payload: { [idKey]: idValue, title: trimmed }
      });
    } else {
      setValue(initialValue);
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setValue(initialValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div 
        className="w-full flex flex-col gap-2 animate-in fade-in zoom-in duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") handleCancel(e);
          }}
          className={`w-full bg-white border-2 border-emerald-400 rounded-xl p-2 focus:ring-4 focus:ring-emerald-100 outline-none resize-none text-emerald-950 shadow-inner ${className}`}
          rows={2}
        />
        <div className="flex justify-end gap-2">
          <button 
            onClick={handleCancel}
            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
            title="Cancelar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <button 
            onClick={handleSave}
            className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-sm active:scale-95"
            title="Guardar cambios"
          >
            <CheckIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative flex items-start w-full cursor-text"
      onClick={() => setIsEditing(true)}
    >
      <span className={`flex-1 pr-6 transition-colors group-hover:text-emerald-700 ${className}`}>
        {initialValue}
      </span>
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
        <EditIcon className="h-4 w-4 text-emerald-400 hover:text-emerald-600" />
      </div>
    </div>
  );
};