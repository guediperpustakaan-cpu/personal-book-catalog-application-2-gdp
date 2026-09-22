import { inisial } from "@/lib/format";
import { cn } from "@/utils/cn";

const PALET_SAMPUl = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-stone-500 to-stone-700",
];

/**
 * Sampul buku. Bila tidak ada foto, tampilkan sampul warna dengan inisial judul
 * agar daftar tetap terlihat rapi tanpa memuat gambar.
 */
export function BookCover({
  judul,
  url,
  alt,
  ukuran = "sedang",
  className,
}: {
  judul: string;
  url?: string | null;
  alt?: string;
  ukuran?: "kecil" | "sedang" | "besar";
  className?: string;
}) {
  const ukuranKelas = {
    kecil: "h-12 w-9 text-[10px] rounded-md",
    sedang: "w-full aspect-3/4 text-base rounded-xl",
    besar: "w-full aspect-3/4 text-2xl rounded-2xl",
  }[ukuran];

  if (url) {
    return (
      <img
        src={url}
        alt={alt ?? `Sampul buku ${judul}`}
        loading="lazy"
        decoding="async"
        className={cn("bg-stone-100 object-cover shadow-sm dark:bg-stone-800", ukuranKelas, className)}
      />
    );
  }

  const indeks = judul.length % PALET_SAMPUl.length;
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center bg-gradient-to-br font-semibold tracking-wide text-white shadow-sm",
        PALET_SAMPUl[indeks],
        ukuranKelas,
        className
      )}
    >
      <span className="select-none">{inisial(judul)}</span>
      <span className="sr-only">Sampul buku {judul}</span>
    </div>
  );
}
