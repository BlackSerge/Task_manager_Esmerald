import React from "react";
import { createPortal } from "react-dom"; 
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "danger" | "primary";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen, onClose, onConfirm, title, description, 
  confirmText = "Confirmar", variant = "primary"
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose} 
    >
      <div 
        className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-emerald-100 animate-in zoom-in duration-300 relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-emerald-50 rounded-full text-emerald-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-xl font-black text-emerald-950 mb-2">{title}</h3>
        <p className="text-emerald-600/70 text-sm font-medium leading-relaxed mb-8">
          {description}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className={`w-full p-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg ${
              variant === 'danger' 
                ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700' 
                : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="w-full p-4 rounded-2xl font-black text-emerald-600 hover:bg-emerald-50 transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};