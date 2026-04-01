import React, { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft, Layout, Hash, Info, Move } from "lucide-react";
import { Board, Card } from "../../types";

interface MoveCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  board: Board;
  onMove: (toColumnId: number, order: number) => void;
}

export const MoveCardModal: React.FC<MoveCardModalProps> = ({ 
  isOpen, 
  onClose, 
  card, 
  board, 
  onMove 
}) => {
  const [selectedColId, setSelectedColId] = useState<number>(card.column);
  const [selectedOrder, setSelectedOrder] = useState<number>(card.order + 1);

  const selectedColumn = useMemo(() => 
    board.columns.find(col => col.id === selectedColId), 
  [board.columns, selectedColId]);

  const positions = useMemo(() => {
    const count = selectedColumn?.cards?.length || 0;
    const max = selectedColId === card.column ? count : count + 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [selectedColumn, selectedColId, card.column]);

  const handleConfirm = useCallback(() => {
    onMove(selectedColId, selectedOrder - 1);
    onClose();
  }, [selectedColId, selectedOrder, onMove, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER CONSISTENTE */}
        <header className="bg-emerald-50/50 px-8 py-6 flex justify-between items-center border-b border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-200">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h2 className="font-black uppercase tracking-widest text-[11px]">Mover Tarjeta</h2>
              <p className="text-[10px] font-bold opacity-40 truncate max-w-[180px]">{card.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-red-50 hover:text-red-500 text-emerald-300 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-6">
          {/* INFO BOX */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
            <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
              Al mover la tarjeta, su posición se ajustará automáticamente y notificará a los colaboradores.
            </p>
          </div>

          {/* SELECTOR DE COLUMNA */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <Layout size={14} /> Columna Destino
            </label>
            <div className="relative group">
              <select 
                value={selectedColId}
                onChange={(e) => {
                  setSelectedColId(Number(e.target.value));
                  setSelectedOrder(1);
                }}
                className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-50 rounded-2xl focus:border-emerald-500 outline-none text-emerald-950 font-black transition-all appearance-none cursor-pointer"
              >
                {board.columns.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.title} {col.id === card.column ? '• Actual' : ''}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                <Move size={16} />
              </div>
            </div>
          </div>

          {/* SELECTOR DE POSICIÓN */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 px-1">
              <Hash size={14} /> Posición en la lista
            </label>
            <div className="grid grid-cols-4 gap-2">
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setSelectedOrder(pos)}
                  className={`
                    py-3 rounded-xl font-black text-xs transition-all border-2
                    ${selectedOrder === pos 
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
                      : "bg-emerald-50/30 border-emerald-50 text-emerald-900/60 hover:border-emerald-200"
                    }
                  `}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER ACCIONES */}
          <footer className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <Move size={16} />
              Confirmar Movimiento
            </button>
          </footer>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};