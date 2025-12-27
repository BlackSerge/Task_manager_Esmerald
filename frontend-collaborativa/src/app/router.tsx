import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/home/pages/HomePage";
import {LoginPage} from "@/features/auth/pages/LoginPage"; 
import {RegisterPage} from "@/features/auth/pages/RegisterPage";
import {BoardsPage} from "@/features/boards/pages/BoardsPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { BoardDetailPage } from "@/features/boards/pages/BoardDetailPage";
import { ProtectedRoute } from "@/features/boards/components/ProtectedRoute";

export const appRouter = createBrowserRouter([
  // RUTAS PÚBLICAS
  { 
    path: "/", 
    element: <HomePage /> 
  },
  { 
    path: "/login", 
    element: <LoginPage /> 
  },
  { 
    path: "/register", 
    element: <RegisterPage /> 
  },

  // RUTAS PRIVADAS (Protegidas por un componente de guardia)
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/boards", element: <BoardsPage /> },
      { path: "/boards/:boardId", element: <BoardDetailPage /> },
    ],
  },

  // REDIRECCIÓN PARA RUTAS NO EXISTENTES
  { 
    path: "*", 
    element: <Navigate to="/" replace /> 
  },
]);