// src/app/providers.tsx
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient"; // Importamos el cliente creado arriba

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    // ✅ Aquí es donde faltaba el argumento 'client'
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}