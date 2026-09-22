import type { ReactNode } from "react";
import { BookOpen, SearchX } from "lucide-react";

export function EmptyState({
  judul,
  pesan,
  ikon,
  aksi,
}: {
  judul: string;
  pesan: string;
  ikon?: ReactNode;
  aksi?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center dark:border-stone-700 dark:bg-stone-900/40">
      <span
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        aria-hidden="true"
      >
        {ikon ?? <BookOpen className="h-7 w-7" />}
      </span>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">{judul}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-stone-500 dark:text-stone-400">{pesan}</p>
      {aksi && <div className="mt-2">{aksi}</div>}
    </div>
  );
}

export function EmptyStatePencarian({ pesan }: { pesan: string }) {
  return (
    <EmptyState
      ikon={<SearchX className="h-7 w-7" />}
      judul="Tidak ada buku yang cocok"
      pesan={pesan}
    />
  );
}
