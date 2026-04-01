import { Board, Column, Card, BoardMember, PriorityLevel, UserRole } from "../../types";
import { AuthUser } from "@/features/auth";

export const mockUser: AuthUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
};

export const mockMember: BoardMember = {
  user: mockUser,
  role: "admin" as UserRole,
  joined_at: "2023-01-01T00:00:00Z"
};

export const mockCard: Card = {
  id: 100,
  title: "Test Card 1",
  description: "Description for test card 1",
  priority: "high" as PriorityLevel,
  is_completed: false,
  order: 0,
  created_at: "2023-01-01T00:00:00Z",
  column: 10
};

export const mockColumn: Column = {
  id: 10,
  title: "To Do",
  order: 0,
  board: 1, 
  cards: [mockCard]
};

export const mockBoard: Board = {
  id: 1,
  title: "Test Board",
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
  last_activity: "2023-01-01T00:00:00Z",
  total_cards: 1,
  completed_cards: 0,
  progress_percentage: 0,
  current_user_role: "admin" as UserRole,
  owner: mockUser,
  members: [mockMember],
  columns: [mockColumn]
};
