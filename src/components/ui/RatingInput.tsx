import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

/** Input rating pribadi 0-5 dengan bintang, dapat dioperasikan lewat papan tik. */
export function RatingInput({
  nilai,
  ubah,
  nama = "rating",
  ukuran = "sedang",
}: {
  nilai: number | null;
  ubah: (nilai: number | null) => void;
  nama?: string;
  ukuran?: "kecil" | "sedang";
}) {
  const ukuranIkon = ukuran === "kecil" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating pribadi">
      {[1, 2, 3, 4, 5].map((bintang) => {
        const aktif = (nilai ?? 0) >= bintang;
        return (
          <button
            key={bintang}
            type="button"
            name={nama}
            aria-label={`${bintang} bintang`}
            aria-pressed={aktif}
            onClick={() => ubah(nilai === bintang ? null : bintang)}
            className={cn(
              "rounded-md p-0.5 transition-transform hover:scale-110",
              aktif
                ? "text-amber-500"
                : "text-stone-300 hover:text-amber-400 dark:text-stone-600 dark:hover:text-amber-500"
            )}
          >
            <Star className={ukuranIkon} fill={aktif ? "currentColor" : "none"} aria-hidden="true" />
          </button>
        );
      })}
      <span className="ml-1.5 text-sm text-stone-500 dark:text-stone-400">
        {nilai ? `${nilai} dari 5` : "Belum dinilai"}
      </span>
    </div>
  );
}

export function TampilanRating({ nilai }: { nilai: number | null }) {
  if (nilai === null || nilai === undefined) {
    return <span className="text-xs text-stone-400">Belum dinilai</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-200">
      <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" aria-hidden="true" />
      {nilai.toFixed(1).replace(".", ",")}
      <span className="sr-only">dari 5 bintang</span>
    </span>
  );
}
