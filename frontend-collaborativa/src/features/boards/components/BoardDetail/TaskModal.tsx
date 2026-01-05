// src/features/boards/components/BoardDetail/TaskModal.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { PriorityLevel } from "../../types/board.types";
import { PrioritySelector } from "../PrioritySelector";
import { X, AlignLeft, Type, Plus, Loader2 } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string; priority: PriorityLevel }) => void;
  columnId: number;
  isSaving?: boolean; // 💡 Agregado para feedback visual
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  isSaving = false 
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("medium");

  if (!isOpen) return null;

 // src/features/boards/components/BoardDetail/TaskModal.tsx

// ... dentro del componente TaskModal
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;
    
    // 🔍 LOG 1: Verificar qué tiene el estado local antes de salir del modal
    console.log("📝 TaskModal: Enviando a onSave ->", { title, priority });
    
    onSave({ title, description, priority });
  };

  // ... en el JSX del PrioritySelector
  <PrioritySelector 
    selected={priority} 
    onChange={(val) => {
      // 🔍 LOG 2: Verificar que el selector realmente cambia el estado
      console.log("🎯 TaskModal: Cambio de prioridad detectado ->", val);
      setPriority(val);
    }} 
  />
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-50/50 px-8 py-6 flex justify-between items-center border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200">
              <Plus size={18} />
            </div>
            <h2 className="font-black uppercase tracking-widest text-sm">Nueva Tarea</h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSaving}
            className="p-2 hover:bg-red-50 hover:text-red-500 text-emerald-300 rounded-full transition-colors disabled:opacity-0"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <Type size={14} /> Título de la tarea
            </label>
            <input
              autoFocus
              type="text"
              disabled={isSaving}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diseñar prototipo de alta fidelidad"
              className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 outline-none text-emerald-950 font-bold placeholder:text-emerald-200 transition-all disabled:opacity-50"
            />
          </div>

          {/* Prioridad */}
          <PrioritySelector 
    selected={priority} 
    onChange={(val) => {
      // 🔍 LOG 2: Verificar que el selector realmente cambia el estado
      console.log("🎯 TaskModal: Cambio de prioridad detectado ->", val);
      setPriority(val);
    }} 
  />

          {/* Descripción */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <AlignLeft size={14} /> Descripción
            </label>
            <textarea
              rows={4}
              disabled={isSaving}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles adicionales sobre esta tarea..."
              className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 outline-none text-sm resize-none text-emerald-900/80 leading-relaxed transition-all disabled:opacity-50"
            />
          </div>

          {/* Botones */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSaving}
              className="flex-[2] py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Tarea"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};