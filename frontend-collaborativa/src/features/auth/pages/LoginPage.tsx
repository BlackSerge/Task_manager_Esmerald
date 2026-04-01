import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useLogin } from "../hooks/useAuth";
import { ApiErrorResponse } from "../types";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate("/boards", { replace: true });
        },
        onError: (err: unknown) => {
          const axiosError = err as AxiosError<ApiErrorResponse>;
          setErrorMsg(axiosError.response?.data?.detail || "Error de credenciales");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/50 px-4 font-sans text-emerald-950">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/5 border border-emerald-100 animate-in fade-in zoom-in duration-300"
        >
          <header className="text-center mb-8">
            <h1 className="text-3xl font-black text-emerald-600 tracking-tight">
              Portfolio Manager
            </h1>
            <p className="text-emerald-500/70 mt-2 text-sm font-bold uppercase tracking-widest leading-relaxed">
              Bienvenido de nuevo
            </p>
          </header>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg flex items-center gap-3 animate-in slide-in-from-left-2">
              <AlertCircle className="shrink-0 text-red-500 w-5 h-5" />
              <p className="font-semibold">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">
                Usuario
              </label>
              <input
                type="text"
                autoComplete="username"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-emerald-400/60 text-emerald-900 font-medium"
                required
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-emerald-400/60 text-emerald-900 font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors p-1"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200 active:scale-95 flex justify-center items-center mt-2"
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </div>

          <footer className="mt-8 pt-6 border-t border-emerald-50 text-center">
            <p className="text-sm text-emerald-700/60 font-medium">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-emerald-600 font-black hover:text-emerald-800 transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </footer>
        </form>
      </div>
    </div>
  );
};