import { createBrowserRouter, Navigate } from "react-router-dom";
import { HomePage } from "@/features/landing/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage"; 
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { BoardsPage } from "@/features/boards/pages/BoardsPage";
import { BoardDetailPage } from "@/features/boards/pages/BoardDetailPage";
import { PublicRoute } from "@/shared/guards/PublicRoute";
import { MainLayout } from "@/shared/layout/MainLayout";
import { ProtectedRoute } from "@/shared/guards/ProtectedRoute";

/**
 * appRouter: Definición centralizada de rutas.
 * Se utiliza una estructura jerárquica para facilitar la aplicación de Guards.
 */
export const appRouter = createBrowserRouter([
  // --- RUTAS DE AUTENTICACIÓN (Públicas) ---
  { 
    element: <PublicRoute />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ]
  },

  // --- RUTA LANDING ---
  { 
    path: "/", 
    element: <HomePage /> 
  },

  // --- RUTAS DE APLICACIÓN (Protegidas) ---
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Usamos paths absolutos para evitar ambigüedad durante la navegación reactiva
          { path: "/boards", element: <BoardsPage /> },
          { path: "/boards/:boardId", element: <BoardDetailPage /> },
        ],
      },
    ],
  },

  // --- UTILIDADES Y FALLBACK ---
  { path: "/dashboard", element: <Navigate to="/boards" replace /> },
  { 
    path: "*", 
    element: <Navigate to="/" replace /> 
  },
]);