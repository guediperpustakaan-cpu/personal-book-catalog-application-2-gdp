import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-shimmer rounded-lg bg-stone-200/70 dark:bg-stone-800/70", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonKartuBuku() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
      <Skeleton className="aspect-3/4 w-full rounded-xl" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-2/3" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonDaftarBuku({ jumlah = 8 }: { jumlah?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: jumlah }).map((_, i) => (
        <SkeletonKartuBuku key={i} />
      ))}
    </div>
  );
}

export function SkeletonBaris({ jumlah = 5 }: { jumlah?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: jumlah }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function SkeletonStatistik({ jumlah = 6 }: { jumlah?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: jumlah }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-stone-500 dark:text-stone-400">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-indigo-600"
        aria-hidden="true"
      />
      <span>{label ?? "Memuat data…"}</span>
    </div>
  );
}
