import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PropModal {
  terbuka: boolean;
  tutup: () => void;
  judul: string;
  deskripsi?: string;
  children: ReactNode;
  aksi?: ReactNode;
  ukuran?: "kecil" | "sedang" | "besar";
}

const ukuranKelas = {
  kecil: "max-w-md",
  sedang: "max-w-xl",
  besar: "max-w-3xl",
};

/** Modal yang dapat ditutup dengan tombol Escape atau klik di luar area. */
export function Modal({
  terbuka,
  tutup,
  judul,
  deskripsi,
  children,
  aksi,
  ukuran = "sedang",
}: PropModal) {
  const refDialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terbuka) return;
    const tanganiTombol = (e: KeyboardEvent) => {
      if (e.key === "Escape") tutup();
    };
    document.addEventListener("keydown", tanganiTombol);
    const sebelumnya = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    refDialog.current?.focus();
    return () => {
      document.removeEventListener("keydown", tanganiTombol);
      document.body.style.overflow = sebelumnya;
    };
  }, [terbuka, tutup]);

  if (!terbuka) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) tutup();
      }}
    >
      <div
        ref={refDialog}
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        tabIndex={-1}
        className={cn(
          "animate-slide-up flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-2xl dark:bg-stone-900",
          ukuranKelas[ukuran]
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">{judul}</h2>
            {deskripsi && (
              <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">{deskripsi}</p>
            )}
          </div>
          <button
            type="button"
            onClick={tutup}
            aria-label="Tutup jendela"
            className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {aksi && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3 dark:border-stone-800 dark:bg-stone-950/40">
            {aksi}
          </div>
        )}
      </div>
    </div>
  );
}
