import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

export type JenisToast = "sukses" | "gagal" | "peringatan" | "info";

export interface Toast {
  id: number;
  jenis: JenisToast;
  judul: string;
  pesan?: string;
}

interface NilaiToast {
  tampilkan: (toast: Omit<Toast, "id">) => void;
  sukses: (judul: string, pesan?: string) => void;
  gagal: (judul: string, pesan?: string) => void;
  peringatan: (judul: string, pesan?: string) => void;
  info: (judul: string, pesan?: string) => void;
}

const KonteksToast = createContext<NilaiToast | null>(null);

const gayaJenis: Record<JenisToast, { ikon: typeof Info; kelas: string; label: string }> = {
  sukses: { ikon: CheckCircle2, kelas: "text-emerald-600 dark:text-emerald-400", label: "Berhasil" },
  gagal: { ikon: XCircle, kelas: "text-rose-600 dark:text-rose-400", label: "Gagal" },
  peringatan: { ikon: AlertTriangle, kelas: "text-amber-600 dark:text-amber-400", label: "Peringatan" },
  info: { ikon: Info, kelas: "text-indigo-600 dark:text-indigo-400", label: "Info" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);
  const nomor = useRef(0);

  const tutup = useCallback((id: number) => {
    setDaftar((d) => d.filter((t) => t.id !== id));
  }, []);

  const tampilkan = useCallback(
    (toast: Omit<Toast, "id">) => {
      nomor.current += 1;
      const id = nomor.current;
      setDaftar((d) => [...d.slice(-3), { ...toast, id }]);
      setTimeout(() => tutup(id), toast.jenis === "gagal" ? 6000 : 4000);
    },
    [tutup]
  );

  const nilai = useMemo<NilaiToast>(
    () => ({
      tampilkan,
      sukses: (judul, pesan) => tampilkan({ jenis: "sukses", judul, pesan }),
      gagal: (judul, pesan) => tampilkan({ jenis: "gagal", judul, pesan }),
      peringatan: (judul, pesan) => tampilkan({ jenis: "peringatan", judul, pesan }),
      info: (judul, pesan) => tampilkan({ jenis: "info", judul, pesan }),
    }),
    [tampilkan]
  );

  return (
    <KonteksToast.Provider value={nilai}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:bottom-auto sm:right-0 sm:top-0 sm:items-end"
      >
        {daftar.map((t) => {
          const { ikon: Ikon, kelas, label } = gayaJenis[t.jenis];
          return (
            <div
              key={t.id}
              role="status"
              className="animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-900/5 dark:border-stone-700 dark:bg-stone-900"
            >
              <Ikon className={cn("mt-0.5 h-5 w-5 shrink-0", kelas)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                  {t.judul}
                </p>
                {t.pesan && (
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {t.pesan}
                  </p>
                )}
                <span className="sr-only">{label}</span>
              </div>
              <button
                type="button"
                onClick={() => tutup(t.id)}
                aria-label="Tutup notifikasi"
                className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </KonteksToast.Provider>
  );
}

export function useToast(): NilaiToast {
  const ctx = useContext(KonteksToast);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider.");
  return ctx;
}


