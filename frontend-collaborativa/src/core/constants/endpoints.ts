export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "api/auth/login/",
    REGISTER: "api/auth/register/",
  },
  USERS: {
    SEARCH: "api/users/search/",
  },
  BOARDS: {
    BASE: "api/boards/",
    DETAIL: (id: string | number) => `api/boards/${id}/`,
    MEMBERS: (boardId: string | number) => `api/boards/${boardId}/members/`,
    INVITE: (boardId: string | number) => `api/boards/${boardId}/members/invite/`,
  },
  COLUMNS: {
    BASE: "api/boards/columns/",
    BY_BOARD: (boardId: string | number) => `api/boards/columns/?board_id=${boardId}`,
  },
  CARDS: {
    BASE: "api/boards/cards/",
    BY_COLUMN: (columnId: string | number) => `api/boards/cards/?column_id=${columnId}`,
  },
  CHAT: {
    MESSAGES: (boardId: string | number) => `api/chat/boards/${boardId}/messages/`,
  }
} as const;