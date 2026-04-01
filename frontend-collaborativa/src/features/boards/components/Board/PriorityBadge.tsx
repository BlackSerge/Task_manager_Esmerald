import React from "react";

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
};

const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const key = priority?.toLowerCase() || "medium";
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${priorityStyles[key] || priorityStyles.medium}`}>
      {priorityLabels[key] || "Media"}
    </span>
  );
};