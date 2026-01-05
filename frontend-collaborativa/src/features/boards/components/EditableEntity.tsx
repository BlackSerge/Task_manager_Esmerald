import React, { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

interface Props {
  initialValue: string;
  onSave: (newValue: string) => void;
  isEditing?: boolean;    // 💡 Permite al Dropdown activar la edición
  onCancel?: () => void;  // 💡 Notifica al padre cuando se cierra
  className?: string;
}

export const EditableEntity: React.FC<Props> = ({ 
  initialValue, 
  onSave, 
  isEditing: externalIsEditing,
  onCancel,
  className 
}) => {
  // Estado interno si no se pasa el externo, o sincronizado con el externo
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(initialValue);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  // Sincronizar valor si cambia externamente
  useEffect(() => {
    setTempValue(initialValue);
  }, [initialValue]);

  // Auto-focus al entrar en modo edición
  useEffect(() => {
    if (isEditing) {
      textAreaRef.current?.focus();
      textAreaRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempValue.trim();
    if (trimmed && trimmed !== initialValue) {
      onSave(trimmed);
    }
    closeEditing();
  };

  const closeEditing = () => {
    setInternalIsEditing(false);
    if (onCancel) onCancel();
  };

  if (isEditing) {
    return (
      <div className="w-full flex flex-col gap-2 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <textarea
          ref={textAreaRef}
          className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 outline-none text-emerald-950 text-sm font-bold resize-none shadow-inner"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
            if (e.key === "Escape") closeEditing();
          }}
          rows={2}
        />
        <div className="flex justify-end gap-1 px-1">
          <button 
            onClick={closeEditing} 
            className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
            title="Cancelar"
          >
            <X size={18}/>
          </button>
          <button 
            onClick={handleSave} 
            className="p-1.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 active:scale-95 transition-all"
            title="Guardar cambios"
          >
            <Check size={18}/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative w-full cursor-text ${className}`} 
      onClick={() => setInternalIsEditing(true)}
    >
      <p className="break-words leading-tight">{initialValue}</p>
      {/* Indicador sutil de edición al hacer hover */}
      <div className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};