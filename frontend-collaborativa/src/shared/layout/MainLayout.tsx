import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";

/**
 * Layout principal para las rutas autenticadas.
 * Define la estructura global: Navbar fija y área de contenido dinámico.
 */
export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100">
      {/* Navegación global del sistema */}
      <Navbar />

      {/* Contenedor principal de la aplicación */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pt-4 pb-12 px-4 md:px-6 lg:px-8">
        <section className="max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Outlet />
        </section>
      </main>
    </div>
  );
};