import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Layout, ArrowRight, Sparkles } from "lucide-react"; // Usamos Lucide
import { useAuthStore } from "@/features/auth/store/auth.store";

export const HomePage: React.FC = () => {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-700 to-green-900 flex flex-col items-center justify-center text-white px-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-400/10 rounded-full blur-[120px]" />

      <header className="absolute top-0 w-full p-6 flex justify-between items-center max-w-7xl z-10">
        <h1 className="text-2xl font-black tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
             <Layout className="text-emerald-600 w-6 h-6" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
            PortfolioManager
          </span>
        </h1>

        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-4 bg-black/10 p-1 pl-4 rounded-2xl border border-white/10">
              <span className="hidden md:block text-emerald-100 text-sm font-black uppercase tracking-widest">
                {user?.username}
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-xl transition-all text-xs font-black uppercase"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 hover:bg-white/10 rounded-xl transition-all text-sm font-bold">
                Entrar
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-white text-emerald-700 font-black rounded-xl shadow-xl hover:scale-105 transition-all text-sm"
              >
                Empezar
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="text-center max-w-4xl relative z-10">
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          <Sparkles size={12} />
          Esmerald Proyect
        </div>
        
        <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          Tus proyectos, <br />
          <span className="text-emerald-300">bajo control.</span>
        </h2>
        
        <p className="text-lg md:text-xl text-emerald-100/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          {token 
            ? `Bienvenido, ${user?.username}. Tu ecosistema de trabajo está listo.`
            : "La alternativa minimalista para gestionar tu portafolio. Visualiza, organiza y completa tus tareas con una interfaz diseñada para la claridad absoluta."
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to={token ? "/boards" : "/register"} 
            className={`group px-10 py-5 ${
              token 
                ? "bg-white text-emerald-900 hover:bg-emerald-50" 
                : "bg-emerald-400 hover:bg-emerald-300 text-emerald-950"
            } text-lg font-black rounded-[2rem] shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3`}
          >
            {token ? "Ir a mis Tableros" : "Crear mi Cuenta"}
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-center">
        <p className="text-emerald-300/40 text-[10px] font-black tracking-[0.3em] uppercase">
          © 2025 PortfolioManager • Emerald 
        </p>
      </footer>
    </div>
  );
};