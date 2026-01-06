// src/features/boards/components/BoardSkeleton.tsx
import React from "react";

export const BoardSkeleton: React.FC = () => {
  // Creamos un array de 6 elementos para mostrar varios cuadros de carga
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {skeletonCards.map((_, index) => (
        <div 
          key={index}
          className="h-32 w-full bg-emerald-100/50 rounded-xl border border-emerald-200/50 relative overflow-hidden shadow-sm"
        >
          {/* Efecto Shimmer (Brillo animado) */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          
          <div className="p-4 space-y-3">
            {/* "Título" del tablero en el skeleton */}
            <div className="h-4 bg-emerald-200/60 rounded-md w-3/4"></div>
            {/* "Meta info" o fecha */}
            <div className="h-3 bg-emerald-200/40 rounded-md w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};