import React from "react";
import { PriorityLevel } from "../../types/board.types";
import { ChevronRight } from "lucide-react";

interface PrioritySelectorProps {
  selected: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ selected, onChange }) => {
  const priorities: { id: PriorityLevel; label: string; color: string }[] = [
    { id: 'low', label: 'Baja', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'medium', label: 'Media', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'high', label: 'Alta', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {priorities.map((p) => {
        const isSelected = selected === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`
              relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300
              ${isSelected 
                ? `${p.color} ring-4 ring-emerald-500/10 scale-[1.02] shadow-sm` 
                : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'
              }
            `}
          >
            <span className="text-[10px] font-black uppercase tracking-tighter mb-1">
              {p.label}
            </span>
            {isSelected && <ChevronRight size={12} className="opacity-50" />}
          </button>
        );
      })}
    </div>
  );
};