import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const HomePage: React.FC = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Nos mantenemos en Home pero ahora verá Login/Register
  };

  return (
    /* Cambiamos a un gradiente de Verde Esmeralda a Verde Oscuro Profundo */
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900 flex flex-col items-center justify-center text-white px-4">
      
      {/* Header Dinámico */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          {/* Un pequeño icono distintivo */}
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
             <div className="w-4 h-4 bg-emerald-600 rounded-sm"></div>
          </div>
          PortfolioManager
        </h1>

        <div className="flex items-center gap-4">
          {token ? (
            <>
              <span className="hidden md:block text-emerald-100 text-sm font-medium">
                {user?.username}
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 border border-red-500/30 rounded-lg transition-all text-sm font-bold"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 hover:bg-white/10 rounded-lg transition-all text-sm font-medium">
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 bg-white text-emerald-700 font-bold rounded-lg shadow-xl hover:bg-emerald-50 transition-all text-sm"
              >
                Regístrate
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="text-center max-w-4xl">
        <div className="mb-6 inline-block px-4 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-widest animate-pulse">
          Organización de alto nivel
        </div>
        
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Tus proyectos, <br />
          <span className="text-emerald-300">bajo control.</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-emerald-100/80 mb-12 max-w-2xl mx-auto leading-relaxed">
          {token 
            ? `Bienvenido de nuevo. Tienes tus tableros listos para continuar con el progreso de hoy.`
            : "La alternativa minimalista para gestionar tu portafolio. Visualiza, organiza y completa tus tareas con una interfaz diseñada para la claridad."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to={token ? "/boards" : "/register"} 
            className={`px-10 py-5 ${
              token 
                ? "bg-white text-emerald-800 hover:bg-emerald-50" 
                : "bg-emerald-400 hover:bg-emerald-300 text-emerald-900"
            } text-lg font-black rounded-2xl shadow-[0_20px_50px_rgba(16,_185,_129,_0.3)] transition-all transform hover:-translate-y-1 active:scale-95`}
          >
            {token ? "Entrar a mis Tableros" : "Empieza Gratis Ahora"}
          </Link>
          
          {!token && (
            <Link to="/login" className="text-emerald-200 hover:text-white font-semibold transition-colors">
              Ver demo del sistema →
            </Link>
          )}
        </div>
      </main>

      <footer className="absolute bottom-8 flex flex-col items-center gap-2">
        <div className="h-px w-12 bg-emerald-400/30 mb-2"></div>
        <p className="text-emerald-300/60 text-xs font-medium tracking-widest uppercase">
          © 2025 PortfolioManager • Pro Edition
        </p>
      </footer>
    </div>
  );
};