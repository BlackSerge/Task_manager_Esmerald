// src/features/boards/components/PrioritySelector.tsx
import React from "react";
import { PriorityLevel } from "../types/board.types";

const priorities: { value: PriorityLevel; label: string; color: string }[] = [
  { value: "low", label: "Baja", color: "bg-emerald-100 text-emerald-700" },
  { value: "medium", label: "Media", color: "bg-amber-100 text-amber-700" },
  { value: "high", label: "Alta", color: "bg-orange-100 text-orange-700" },
 
];

interface Props {
  selected: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
}

export const PrioritySelector: React.FC<Props> = ({ selected, onChange }) => (
  <div className="flex gap-2">
    {priorities.map((p) => (
      <button
        key={p.value}
        type="button"
        onClick={() => onChange(p.value)}
        className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 
          ${selected === p.value ? `${p.color} border-current scale-105 shadow-md` : "bg-gray-50 border-transparent text-gray-400 opacity-60 hover:opacity-100"}`}
      >
        {p.label}
      </button>
    ))}
  </div>
);