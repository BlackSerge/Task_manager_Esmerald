// src/shared/utils/date.utils.ts

/**
 * Formatea una fecha de manera "humana" o relativa.
 * Ejemplo: "Hoy", "Ayer", "hace 3 días" o "25 dic 2025"
 */
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "---";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Lógica de fechas relativas
  if (diffInDays === 0) {
    // Si fue hace menos de 1 hora, podríamos poner "Recién"
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    if (diffInMinutes < 1) return "Ahora mismo";
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    return "Hoy";
  }
  
  if (diffInDays === 1) return "Ayer";
  if (diffInDays < 7) return `Hace ${diffInDays} días`;

  // Formato estándar para fechas más antiguas
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/**
 * Formato detallado para tooltips o modales (ej: 29 de diciembre de 2025, 14:30)
 */
export const formatFullDate = (dateString: string | undefined | null): string => {
  if (!dateString) return "---";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Fecha inválida";

  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};