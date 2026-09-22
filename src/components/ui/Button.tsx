import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variasi = "utama" | "sekunder" | "hantu" | "bahaya" | "garis";
type Ukuran = "kecil" | "sedang" | "besar";

const gayaVarians: Record<Variasi, string> = {
  utama:
    "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600",
  sekunder:
    "bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700",
  hantu:
    "bg-transparent text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800",
  bahaya:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 active:bg-rose-800",
  garis:
    "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800",
};

const gayaUkuran: Record<Ukuran, string> = {
  kecil: "h-9 px-3 text-sm gap-1.5 rounded-lg",
  sedang: "h-11 px-4 text-sm gap-2 rounded-xl",
  besar: "h-12 px-5 text-base gap-2 rounded-xl",
};

export interface PropButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variasi?: Variasi;
  ukuran?: Ukuran;
  memuat?: boolean;
  ikon?: ReactNode;
  lebarPenuh?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, PropButton>(function Button(
  {
    variasi = "utama",
    ukuran = "sedang",
    memuat = false,
    ikon,
    lebarPenuh = false,
    className,
    children,
    disabled,
    type = "button",
    ...lainnya
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || memuat}
      className={cn(
        "inline-flex select-none items-center justify-center font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        gayaVarians[variasi],
        gayaUkuran[ukuran],
        lebarPenuh && "w-full",
        className
      )}
      {...lainnya}
    >
      {memuat ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        ikon
      )}
      {children}
    </button>
  );
});
