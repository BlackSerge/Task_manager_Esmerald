import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/landing/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage"; 
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { BoardsPage } from "@/features/boards/pages/BoardsPage";
import { BoardDetailPage } from "@/features/boards/pages/BoardDetailPage";
import { PublicRoute } from "@/shared/guards/PublicRoute";
import { MainLayout } from "@/shared/layout/MainLayout";
import { ProtectedRoute } from "@/shared/guards/ProtectedRoute";


export const appRouter = createBrowserRouter([
  { 
    element: <PublicRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ]
  },

  { 
    path: "/", 
    element: <HomePage /> 
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
      
          { path: "/boards", element: <BoardsPage /> },
          { path: "/boards/:boardId", element: <BoardDetailPage /> },
        ],
      },
    ],
  },

  { path: "/dashboard", element: <Navigate to="/boards" replace /> },
  { 
    path: "*", 
    element: <Navigate to="/" replace /> 
  },
]);