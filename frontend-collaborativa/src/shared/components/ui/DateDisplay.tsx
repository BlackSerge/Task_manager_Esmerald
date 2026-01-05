// src/shared/components/DateDisplay.tsx
import React from "react";
import { formatDate } from "@/shared/utils/date.utils";
import { Calendar } from "lucide-react";

interface DateDisplayProps {
  // Mantenemos la flexibilidad de recibir ambos
  date?: string | Date; 
  showIcon?: boolean;
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({ 
  date, 
  showIcon = true, 
  className = "" 
}) => {
  if (!date) return null;

  // 💡 Normalización: Si es un objeto Date, lo convertimos a ISO string 
  // para que formatDate lo procese sin errores de tipo.
  const dateValue = date instanceof Date ? date.toISOString() : date;
  
  const formatted = formatDate(dateValue);

  return (
    <div className={`flex items-center gap-1.5 text-emerald-900/40 ${className}`}>
      {showIcon && <Calendar size={12} className="shrink-0" />}
      <span className="text-[10px] font-black uppercase tracking-tight">
        {formatted}
      </span>
    </div>
  );
};