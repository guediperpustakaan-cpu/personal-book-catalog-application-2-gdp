import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({
  className,
  children,
  ...lainnya
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-900/5 dark:border-stone-800 dark:bg-stone-900",
        className
      )}
      {...lainnya}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  judul,
  deskripsi,
  aksi,
  className,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-800",
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">{judul}</h2>
        {deskripsi && (
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{deskripsi}</p>
        )}
      </div>
      {aksi}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
