// src/features/boards/utils/column.utils.tsx
import { CheckCircle2, Circle, Clock } from "lucide-react";

export const getColumnStatusConfig = (title: string, idx: number, total: number) => {
  const t = title.toLowerCase().trim();
  
  // Reglas de negocio para inferir el estado
  const isDoneKey = t.match(/(hecho|finalizado|done|completado|terminado)/);
  const isProgressKey = t.match(/(proceso|curso|haciendo|doing|progress|progreso)/);
  const isTodoKey = t.match(/(todo|hacer|pendiente|backlog|lista)/);

  // ESTADO: FINALIZADO
  if (isDoneKey || (idx === total - 1 && total > 1 && !isProgressKey && !isTodoKey)) {
    return {
      isDone: true,
      label: "Finalizado",
      bg: "bg-emerald-100/40 border-emerald-200/60 shadow-emerald-500/5",
      text: "text-emerald-700",
      icon: <CheckCircle2 size={14} className="text-emerald-500" />,
      button: "bg-emerald-500 text-white hover:bg-emerald-600 border-transparent shadow-emerald-200"
    };
  }

  // ESTADO: EN CURSO
  if (isProgressKey || (idx > 0 && idx < total - 1)) {
    return {
      isDone: false,
      label: "En curso",
      bg: "bg-blue-100/40 border-blue-200/60 shadow-blue-500/5",
      text: "text-blue-700",
      icon: <Clock size={14} className="text-blue-500 animate-spin-slow" />,
      button: "bg-blue-500 text-white hover:bg-blue-600 border-transparent shadow-blue-200"
    };
  }

  // ESTADO: POR HACER (Default)
  return {
    isDone: false,
    label: "Por hacer",
    bg: "bg-slate-100/50 border-slate-200/60 shadow-slate-900/5",
    text: "text-slate-700",
    icon: <Circle size={14} className="text-slate-400" />,
    button: "bg-white/60 border-white hover:border-emerald-200 text-emerald-600 hover:bg-white shadow-sm"
  };
};