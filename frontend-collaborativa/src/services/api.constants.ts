//centralizamos las URLs. Esto permite que, si el backend cambia una ruta, solo la edites en un lugar.

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  
BOARDS: '/api/boards/',
  
  // NOTA: Tu router usa "columns", no "lists". 
  // Debemos ajustar esto para que coincida con tu backend.
  COLUMNS: (boardId: string) => `/api/columns/?board_id=${boardId}`, 
  CARDS: (columnId: string) => `/api/cards/?column_id=${columnId}`,
};