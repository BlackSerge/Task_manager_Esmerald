import React, { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, AlignLeft, Type, Edit3, Loader2, Save } from "lucide-react";
import { Card, CreateCardPayload } from "../../types/board.types";
import { PrioritySelector } from "./PrioritySelector";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateCardPayload) => void;
  columnId: number;
  initialData?: Card;
  isSaving?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  isSaving = false 
}) => {
 
  const [formData, setFormData] = useState<CreateCardPayload>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    priority: initialData?.priority ?? "medium",
  });

  const handleClose = useCallback(() => {
    if (isSaving) return;
    onClose();
  }, [isSaving, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || isSaving) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  const isEditMode = !!initialData;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bg-emerald-50/50 px-8 py-6 flex justify-between items-center border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200">
              {isEditMode ? <Edit3 size={18} /> : <Type size={18} />}
            </div>
            <h2 className="font-black uppercase tracking-widest text-sm">
              {isEditMode ? "Editar Detalles" : "Nueva Tarea"}
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSaving} 
            className="p-2 hover:bg-red-50 hover:text-red-500 text-emerald-300 rounded-full transition-colors disabled:opacity-30"
          >
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <Type size={14} /> Título de la tarea
            </label>
            <input
              autoFocus
              type="text"
              disabled={isSaving}
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Diseñar prototipo..."
              className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 outline-none text-emerald-950 font-bold transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              Prioridad
            </label>
            <PrioritySelector 
              selected={formData.priority} 
              onChange={(p) => setFormData(prev => ({ ...prev, priority: p }))} 
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <AlignLeft size={14} /> Descripción
            </label>
            <textarea
              rows={4}
              disabled={isSaving}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Añade detalles adicionales..."
              className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 outline-none text-sm resize-none text-emerald-900/80 leading-relaxed transition-all disabled:opacity-50"
            />
          </div>

          <footer className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              disabled={isSaving}
              className="flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || isSaving}
              className="flex-[2] py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  {isEditMode ? "Guardar Cambios" : "Crear Tarea"}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};