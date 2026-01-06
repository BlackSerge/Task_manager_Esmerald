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


const getValidDate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  const date = parseISO(dateString);
  return isValid(date) ? date : null;
};


export const formatDate = (dateString: string | undefined | null): string => {
  const date = getValidDate(dateString);
  if (!date) return "---";

  const now = new Date();

 
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 30) return "Ahora mismo";

  // 2. Lógica para Hoy/Ayer usando date-fns (más preciso que milisegundos manuales)
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }

  if (isYesterday(date)) return "Ayer";

  // 3. Si es hace menos de una semana
  const daysDiff = differenceInDays(now, date);
  if (daysDiff < 7) {
    return `Hace ${daysDiff} días`;
  }

  // 4. Formato estándar para fechas antiguas 
  return format(date, "dd MMM yyyy", { locale: es }).replace(".", "");
};

/**
 * Formato detallado para tooltips o modales.
 */
export const formatFullDate = (dateString: string | undefined | null): string => {
  const date = getValidDate(dateString);
  if (!date) return "---";

  return format(date, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
};