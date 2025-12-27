export interface Card {
  id: number;
  title: string;
  description: string;
  order: number;
}

export interface Column {
  id: number;
  title: string;
  order: number;
  cards: Card[]; // Relación con sus tarjetas
}

export interface Board {
  id: number;
  title: string;
  owner: number;
  columns: Column[]; // Cambiado de lists -> columns para coincidir con el backend
}


export interface BoardsState {
  boards: Board[];
  isLoading: boolean;
  error: string | null;
}


export interface CreateColumnDto {
  boardId: string | number;
  title: string;
}

export interface CreateCardDto {
  listId: string | number;
  title: string;
  description?: string;
}

export interface DeleteColumnParams {
  boardId: string | number;
  columnId: string | number;
}

export interface BoardsActions {
  // Sincronización inicial (carga masiva)
  setBoards: (boards: Board[]) => void;
  
  // Operaciones de Tablero
  addBoard: (board: Board) => void;
  updateBoard: (board: Board) => void;
  // Operaciones de Columnas (Sincronizadas con Create/Delete)
  // boardId es necesario para saber en qué tablero insertar o remover la columna
  addColumn: (boardId: number | string, column: Column) => void;
  removeColumn: (boardId: number | string, columnId: number | string) => void;
  
  // Operaciones de Tarjetas
  // columnId es suficiente para encontrar la columna y añadir/quitar la tarjeta
  addCard: (columnId: number | string, card: Card) => void;
  removeCard: (columnId: number | string, cardId: number | string) => void;
}

// ...existing code...
export type BoardsStore = {
  boards: Board[];
  setBoards: (boards: Board[]) => void;
  updateBoard: (board: Board) => void;
  addBoard: (board: Board) => void;
  addColumn: (boardId: number | string, column: Column) => void;
  removeColumn: (boardId: number | string, columnId: number | string) => void;
  addCard: (columnId: number | string, card: Card) => void;
  removeCard: (columnId: number | string, cardId: number | string) => void;

  // Added to match store implementation
  isLoading: boolean;
  error: string | null;
};
// ...existing code...