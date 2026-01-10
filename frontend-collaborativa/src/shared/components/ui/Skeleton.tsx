import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-emerald-100/40 ${className}`}>
      
      <div 
        className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" 
        style={{ animationDuration: '2s' }}
      />
    </div>
  );
};