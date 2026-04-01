import { RouterProvider } from "react-router-dom";
import Providers from "@/app/providers";
import { appRouter } from "@/app/router";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Loader2 } from "lucide-react";

export default function App() {
  const isHydrated = useAuthStore((state) => state.isHydrated);


  if (!isHydrated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-emerald-50">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <p className="text-emerald-900 font-bold animate-pulse">
          Cargando entorno seguro...
        </p>
      </div>
    );
  }

  return (
    <Providers> 
      <RouterProvider router={appRouter} />
    </Providers>
  );
}