import React, { useState, useMemo, ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { AxiosError } from "axios";
import { Eye, EyeOff, AlertCircle, Loader2, Check, Circle, PartyPopper, UserPlus } from "lucide-react";
import { useRegister } from "../hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ApiErrorResponse } from "../types/auth.types";

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    password2: "" 
  });
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showPassword2, setShowPassword2] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const registerMutation = useRegister();
  const setAuth = useAuthStore((state) => state.setAuth);

  // --- Validación Proactiva ---
  const security = useMemo(() => {
    const p = formData.password;
    return {
      min: p.length >= 8,
      upper: /[A-Z]/.test(p),
      number: /\d/.test(p),
      special: /[@$!%*?&]/.test(p),
    };
  }, [formData.password]);

  const isPasswordSecure = Object.values(security).every(Boolean);
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.password2;
  
  const isFormValid = 
    formData.username.trim().length >= 3 && 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && 
    isPasswordSecure && 
    passwordsMatch;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    setErrorMsg(null);

    registerMutation.mutate(formData, {
      onSuccess: (data) => {
        // 1. Activamos la pantalla de éxito
        setIsSuccess(true);
        
        // 2. Esperamos 2.5 segundos para que el usuario disfrute la bienvenida
        // Solo después de este tiempo llamamos a setAuth, que provoca la redirección
        setTimeout(() => {
          setAuth(data.user, data.access ?? "");
        }, 2500); 
      },
      onError: (err: unknown) => {
        const axiosError = err as AxiosError<ApiErrorResponse>;
        const data = axiosError.response?.data;
        
        if (data?.username) {
          setErrorMsg(`El usuario "${formData.username}" ya existe.`);
        } else if (data?.email) {
          setErrorMsg(`El email "${formData.email}" ya está registrado.`);
        } else {
          setErrorMsg(data?.detail || "Error en el registro. Inténtalo de nuevo.");
        }
      },
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Si el registro fue exitoso, mostramos la vista de bienvenida fija durante el timeout
  if (isSuccess) {
    return <SuccessView username={formData.username} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/50 px-4 font-sans text-emerald-950">
      <div className="w-full max-w-md my-10">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-8 rounded-3xl shadow-2xl shadow-emerald-900/5 border border-emerald-100 animate-in fade-in zoom-in duration-300"
        >
          <header className="text-center mb-8">
            <h1 className="text-3xl font-black text-emerald-600 tracking-tight">Crear cuenta</h1>
            <p className="text-emerald-500/70 mt-2 text-sm font-bold uppercase tracking-widest">Portfolio Manager</p>
          </header>

          {errorMsg && <ErrorAlert message={errorMsg} />}

          <div className="space-y-5">
            <InputField label="Usuario" name="username" placeholder="Tu nombre" value={formData.username} onChange={handleChange} />
            <InputField label="Email" name="email" type="email" placeholder="tu@correo.com" value={formData.email} onChange={handleChange} />

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider ml-1">Seguridad</label>
                <div className="grid grid-cols-2 gap-2 px-1">
                  <RequirementCheck label="8+ caracteres" met={security.min} />
                  <RequirementCheck label="Mayúscula" met={security.upper} />
                  <RequirementCheck label="Número" met={security.number} />
                  <RequirementCheck label="Signo (@$!%)" met={security.special} />
                </div>
              </div>

              <PasswordInput 
                label="Contraseña"
                name="password"
                placeholder="********"
                value={formData.password}
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
                onChange={handleChange}
                isValid={formData.password.length > 0 ? isPasswordSecure : null}
              />

              <PasswordInput 
                label="Confirmar"
                name="password2"
                placeholder="********"
                value={formData.password2}
                show={showPassword2}
                onToggle={() => setShowPassword2(!showPassword2)}
                onChange={handleChange}
                isValid={formData.password2.length > 0 ? passwordsMatch : null}
              />
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || !isFormValid}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-black hover:bg-emerald-700 disabled:opacity-30 disabled:grayscale transition-all shadow-lg shadow-emerald-200 active:scale-95 flex justify-center items-center mt-2"
            >
              {registerMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><UserPlus className="w-5 h-5 mr-2 text-white" /> Registrarse ahora</>}
            </button>
          </div>

          <footer className="mt-8 pt-6 border-t border-emerald-50 text-center text-sm text-emerald-700/60 font-medium">
            ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-600 font-black hover:underline">Inicia sesión</Link>
          </footer>
        </form>
      </div>
    </div>
  );
};

// --- Subcomponentes de Soporte ---

const InputField: React.FC<{ label: string; name: string; value: string; type?: string; placeholder: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider ml-1">{label}</label>
    <input {...props} className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-emerald-900/40 text-emerald-900 font-medium" required />
  </div>
);

const PasswordInput: React.FC<{ label: string; name: string; value: string; placeholder: string; show: boolean; isValid: boolean | null; onToggle: () => void; onChange: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ label, show, onToggle, isValid, ...props }) => (
  <div className="space-y-2">
    <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`w-full p-4 border rounded-2xl focus:ring-2 outline-none transition-all text-emerald-900 font-medium pr-12
          ${isValid === null ? 'border-emerald-100 bg-emerald-50/30 focus:ring-emerald-500' : 
            isValid ? 'border-emerald-500 bg-emerald-50/10 focus:ring-emerald-500' : 
            'border-red-500 bg-red-50/40 focus:ring-red-600'}`}
        required
      />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors p-1">
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  </div>
);

const RequirementCheck: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <div className={`flex items-center gap-2 transition-all duration-300 ${met ? 'text-emerald-600' : 'text-red-600'}`}>
    {met ? <Check size={12} strokeWidth={4} /> : <Circle size={10} strokeWidth={3} className="fill-red-600/10" />}
    <span className={`text-[10px] font-black uppercase tracking-tight`}>{label}</span>
  </div>
);

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 text-red-800 text-xs rounded-r-lg flex items-center gap-3 animate-in shake duration-300">
    <AlertCircle className="shrink-0 text-red-600 w-5 h-5" />
    <p className="font-bold uppercase leading-tight">{message}</p>
  </div>
);

const SuccessView: React.FC<{ username: string }> = ({ username }) => (
  <div className="min-h-screen flex items-center justify-center bg-emerald-50/50">
    <div className="text-center animate-in zoom-in fade-in duration-700">
      <div className="w-28 h-28 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
        <PartyPopper size={56} />
      </div>
      <h1 className="text-4xl font-black text-emerald-950 tracking-tight">¡Bienvenido, {username}!</h1>
      <p className="text-emerald-600/80 font-bold mt-4 flex items-center justify-center gap-3 text-lg">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Estamos preparando tu espacio de trabajo...</span>
      </p>
    </div>
  </div>
);