import React from "react";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  border?: boolean;
  className?: string;
}

export const StatItem: React.FC<StatItemProps> = ({ icon, label, value, border }) => (
  <div className={`flex flex-col gap-1 ${border ? 'border-l border-emerald-50 pl-4' : ''}`}>
    <span className="text-[9px] font-black text-emerald-600/40 uppercase tracking-widest flex items-center gap-1.5">
      {icon} {label}
    </span>
    <span className="text-xl font-black text-emerald-950 tabular-nums">{value}</span>
  </div>
);