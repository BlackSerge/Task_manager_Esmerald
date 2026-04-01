import { 
  format, 
  formatDistanceToNow, 
  isToday, 
  isYesterday, 
  differenceInDays, 
  parseISO, 
  isValid 
} from "date-fns";
import { es } from "date-fns/locale";

/**
 * Normaliza cualquier entrada a un objeto Date válido o null.
 */
const getValidDate = (date: string | Date | undefined | null): Date | null => {
  if (!date) return null;
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return isValid(parsedDate) ? parsedDate : null;
};

/**
 * Formatea una fecha a una cadena relativa dinámica.
 * Soluciona el salto de redondeo de date-fns para los primeros 2 minutos.
 */
export const formatDate = (dateInput: string | Date | undefined | null): string => {
  const date = getValidDate(dateInput);
  if (!date) return "---";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // 1. Manejo de desajustes (Futuro cercano)
  if (diffInSeconds < 0) return "Hace un momento";

  // 2. Umbral "Ahora mismo" (0 a 59 segundos)
  if (diffInSeconds < 60) return "Ahora mismo";

  // 3. Umbral "1 minuto" manual (60 a 119 segundos)
  // Esto evita que date-fns redondee 90s a "hace 2 minutos"
  if (diffInSeconds < 120) return "Hace 1 minuto";

  // 4. Lógica para el resto del día de hoy
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }

  // 5. Ayer
  if (isYesterday(date)) return "Ayer";

  // 6. Menos de una semana (Hace n días)
  const daysDiff = differenceInDays(now, date);
  if (daysDiff < 7) {
    return `Hace ${daysDiff} ${daysDiff === 1 ? 'día' : 'días'}`;
  }

  // 7. Formato absoluto para fechas antiguas
  return format(date, "dd MMM yyyy", { locale: es }).replace(".", "");
};

/**
 * Formato detallado para auditoría o estados extendidos.
 */
export const formatFullDate = (dateInput: string | Date | undefined | null): string => {
  const date = getValidDate(dateInput);
  if (!date) return "---";
  return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
};