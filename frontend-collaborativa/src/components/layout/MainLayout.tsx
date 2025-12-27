// src/components/layout/MainLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar"; // Importamos el nuevo componente

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-emerald-50/30 flex flex-col font-sans">
      {/* Componente Independiente */}
      <Navbar />

      {/* Área de Contenido Dinámico */}
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </div>
      </main>

      {/* Podrías añadir un <Footer /> aquí en el futuro */}
    </div>
  );
};