// src/features/auth/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { useRegister } from "../hooks";
import { useAuthStore } from "@/store/authStore";
import { ApiErrorResponse } from "../types";

// Iconos SVG personalizados para el ojo
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    password2: "" 
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const registerMutation = useRegister();
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.password2) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    registerMutation.mutate(formData, {
      onSuccess: (data) => {
        setAuth(data.user, data.access); 
        navigate("/boards", { replace: true });
      },
      onError: (err: unknown) => {
        if (isAxiosError<ApiErrorResponse>(err)) {
          const errorData = err.response?.data;
          const message = errorData?.password || errorData?.username || errorData?.detail || "Error al registrarse.";
          setErrorMessage(Array.isArray(message) ? message[0] : (message as string));
        } else {
          setErrorMessage("Error de comunicación con el servidor.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/50 px-4 font-sans">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/5 border border-emerald-100 animate-in fade-in zoom-in duration-300"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-emerald-600 tracking-tight">Crear cuenta</h1>
            <p className="text-emerald-500/70 mt-2 text-sm font-bold uppercase tracking-widest leading-relaxed">Únete a Portfolio Manager</p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-center gap-3 animate-in slide-in-from-left-2">
              <span className="shrink-0 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </span>
              <p className="font-semibold">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">Usuario</label>
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                required
              />
            </div>

            {/* Contraseñas con Iconos Interactivos */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword2 ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    value={formData.password2}
                    onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                    className="w-full p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm pr-12 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors p-1"
                  >
                    {showPassword2 ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200 mt-4 active:scale-95 flex justify-center items-center"
            >
              {registerMutation.isPending ? (
                 <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Registrarse Ahora"
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-50 text-center">
            <p className="text-sm text-emerald-700/60 font-medium">
              ¿Ya eres miembro? <Link to="/login" className="text-emerald-600 font-black hover:text-emerald-800 transition-colors">Inicia sesión</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};