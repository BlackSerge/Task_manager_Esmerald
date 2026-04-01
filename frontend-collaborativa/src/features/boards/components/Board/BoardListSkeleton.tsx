import { Skeleton } from "@/shared/components/ui/Skeleton";

export const BoardListSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="h-32 w-full rounded-xl border border-emerald-100/50" />
    ))}
  </div>
);