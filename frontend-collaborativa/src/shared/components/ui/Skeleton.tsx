import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-emerald-100/40 ${className}`}>
      <div 
        /* Cambiamos -left-full por -translate-x-full para mayor compatibilidad */
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" 
      />
    </div>
  );
};