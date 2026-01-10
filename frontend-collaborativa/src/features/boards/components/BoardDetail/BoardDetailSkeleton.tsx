import { Skeleton } from "@/shared/components/ui/Skeleton";

export const BoardDetailSkeleton = () => (
  <div className="flex gap-8 p-10 h-full w-full overflow-hidden">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="w-80 shrink-0 flex flex-col gap-6">
        <Skeleton className="h-12 w-full rounded-3xl" /> 
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-[2.5rem]" />
          <Skeleton className="h-24 w-full rounded-[2.5rem] opacity-60" />
          <Skeleton className="h-40 w-full rounded-[2.5rem] opacity-30" />
        </div>
      </div>
    ))}
    {/* Botón de añadir (Dashed) */}
    <div className="w-80 shrink-0 h-16 border-2 border-dashed border-emerald-100 rounded-3xl animate-pulse" />
  </div>
);