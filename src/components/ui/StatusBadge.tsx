import {
  BOOK_CONDITION_LABEL,
  OWNERSHIP_STATUS_ICON,
  OWNERSHIP_STATUS_LABEL,
  READING_STATUS_ICON,
  READING_STATUS_LABEL,
} from "@/lib/constants";
import { cn } from "@/utils/cn";
import type { BookCondition, OwnershipStatus, ReadingStatus } from "@/types";

const gayaStatusBaca: Record<ReadingStatus, string> = {
  belum_dibaca: "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-600",
  sedang_dibaca: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  sudah_dibaca: "bg-emerald-50 text-emerald-800 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  tidak_ingin_dibaca: "bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800",
};

const gayaKepemilikan: Record<OwnershipStatus, string> = {
  dimiliki: "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-600",
  dipinjamkan: "bg-sky-50 text-sky-800 ring-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
  hilang: "bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800",
  ingin_dijual: "bg-violet-50 text-violet-800 ring-violet-300 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800",
  rusak: "bg-orange-50 text-orange-800 ring-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-800",
};

const gayaKondisi: Record<BookCondition, string> = {
  baru: "bg-emerald-50 text-emerald-800 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  sangat_baik: "bg-teal-50 text-teal-800 ring-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:ring-teal-800",
  baik: "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-600",
  cukup: "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  rusak: "bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800",
};

const dasar =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function StatusBadge({ status }: { status: ReadingStatus | null }) {
  if (!status) return <span className="text-xs text-stone-400">-</span>;
  return (
    <span className={cn(dasar, gayaStatusBaca[status])}>
      <span aria-hidden="true">{READING_STATUS_ICON[status]}</span>
      {READING_STATUS_LABEL[status]}
    </span>
  );
}

export function OwnershipBadge({ status }: { status: OwnershipStatus | null }) {
  if (!status) return <span className="text-xs text-stone-400">-</span>;
  return (
    <span className={cn(dasar, gayaKepemilikan[status])}>
      <span aria-hidden="true">{OWNERSHIP_STATUS_ICON[status]}</span>
      {OWNERSHIP_STATUS_LABEL[status]}
    </span>
  );
}

export function ConditionBadge({ kondisi }: { kondisi: BookCondition | null }) {
  if (!kondisi) return <span className="text-xs text-stone-400">-</span>;
  return <span className={cn(dasar, gayaKondisi[kondisi])}>{BOOK_CONDITION_LABEL[kondisi]}</span>;
}

export function ChipInfo({
  children,
  warna = "netral",
}: {
  children: React.ReactNode;
  warna?: "netral" | "merah" | "kuning" | "hijau" | "biru";
}) {
  const gaya = {
    netral:
      "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-600",
    merah: "bg-rose-50 text-rose-800 ring-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:ring-rose-800",
    kuning:
      "bg-amber-50 text-amber-800 ring-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
    hijau:
      "bg-emerald-50 text-emerald-800 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
    biru: "bg-sky-50 text-sky-800 ring-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
  }[warna];
  return <span className={cn(dasar, gaya)}>{children}</span>;
}
