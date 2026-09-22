import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/** Kartu statistik untuk dashboard, responsif sampai layar kecil. */
export function DashboardCard({
  label,
  nilai,
  ikon,
  petunjuk,
  aksi,
  warna = "indigo",
}: {
  label: string;
  nilai: ReactNode;
  ikon?: ReactNode;
  petunjuk?: string;
  aksi?: ReactNode;
  warna?: "indigo" | "emerald" | "amber" | "sky" | "rose" | "stone";
}) {
  const gayaWarna = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/70 dark:text-sky-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400",
    stone: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  }[warna];

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
        {ikon && (
          <span
            className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", gayaWarna)}
            aria-hidden="true"
          >
            {ikon}
          </span>
        )}
      </div>
      <p className="text-3xl font-semibold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
        {nilai}
      </p>
      {petunjuk && <p className="text-xs text-stone-500 dark:text-stone-400">{petunjuk}</p>}
      {aksi && <div className="mt-auto">{aksi}</div>}
    </div>
  );
}
