// src/components/layout/Navbar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-white border-b border-emerald-100 h-16 flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8">
        <Link to="/boards" className="flex items-center gap-2 group">
          <div className="bg-emerald-600 p-1.5 rounded-lg group-hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <span className="text-xl font-black text-emerald-900 tracking-tighter">PortfolioManager</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-bold text-emerald-700/70">
          <Link to="/boards" className="hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-all">
            Mis Tableros
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block border-r border-emerald-100 pr-4">
          <p className="text-sm font-black text-emerald-900 leading-none">{user?.username}</p>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1 italic">Pro Member</p>
        </div>
        
        <button
          onClick={() => logout()}
          className="p-2 text-emerald-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
          title="Cerrar Sesión"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
};