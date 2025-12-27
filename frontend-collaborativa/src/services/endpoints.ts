// src/constants/endpoints.ts
export const API_ENDPOINTS = {
  // Rutas de core.urls -> path('api/auth/', include('core.urls'))
  LOGIN: "api/auth/login/",
  REGISTER: "api/auth/register/",
  
  // Rutas de boards.urls -> path('api/', include('boards.urls'))
  // El Router registra 'boards', 'columns' y 'cards'
  BOARDS: "api/boards/",
  COLUMNS: "api/columns/",
  CARDS: "api/cards/",
  
  // Detalle de un tablero específico
  BOARD_DETAIL: (id: string) => `api/boards/${id}/`,
};