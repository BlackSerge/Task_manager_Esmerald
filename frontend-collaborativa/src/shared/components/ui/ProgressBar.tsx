import React from "react";

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => (
  <div className="space-y-2 mb-6">
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
      <span className="text-emerald-800/40 text-[9px]">Completado</span>
      <span className="text-emerald-600">{percentage}%</span>
    </div>
    <div className="h-2.5 w-full bg-emerald-50 rounded-full overflow-hidden shadow-inner border border-emerald-100/50">
      <div 
        className={`h-full transition-all duration-1000 ease-out rounded-full ${
          percentage === 100 ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
        style={{ width: `${Math.max(2, percentage)}%` }} 
      />
    </div>
  </div>
);