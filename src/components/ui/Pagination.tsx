import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatAngka } from "@/lib/format";
import { cn } from "@/utils/cn";

export function Pagination({
  halaman,
  totalHalaman,
  totalData,
  ubahHalaman,
  memuat,
}: {
  halaman: number;
  totalHalaman: number;
  totalData: number;
  ubahHalaman: (halaman: number) => void;
  memuat?: boolean;
}) {
  if (totalHalaman <= 1) {
    return (
      <p className="py-3 text-center text-sm text-stone-500 dark:text-stone-400">
        Menampilkan {formatAngka(totalData)} buku
      </p>
    );
  }

  const daftar = halamanDaftar(halaman, totalHalaman);

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 py-4 dark:border-stone-800"
    >
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Halaman {halaman} dari {totalHalaman} · {formatAngka(totalData)} buku
      </p>
      <div className="flex items-center gap-1">
        <Button
          variasi="garis"
          ukuran="kecil"
          ikon={<ChevronLeft className="h-4 w-4" />}
          disabled={halaman <= 1 || memuat}
          onClick={() => ubahHalaman(halaman - 1)}
          aria-label="Halaman sebelumnya"
        >
          Sebelumnya
        </Button>
        {daftar.map((h, i) =>
          h === "…" ? (
            <span key={`titik-${i}`} className="px-1.5 text-sm text-stone-400">
              …
            </span>
          ) : (
            <button
              key={h}
              type="button"
              onClick={() => ubahHalaman(h)}
              aria-current={h === halaman ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition",
                h === halaman
                  ? "bg-indigo-600 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              )}
            >
              {h}
            </button>
          )
        )}
        <Button
          variasi="garis"
          ukuran="kecil"
          disabled={halaman >= totalHalaman || memuat}
          onClick={() => ubahHalaman(halaman + 1)}
          aria-label="Halaman berikutnya"
        >
          Berikutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}

function halamanDaftar(halaman: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const hasil: (number | "…")[] = [1];
  const awal = Math.max(2, halaman - 1);
  const akhir = Math.min(total - 1, halaman + 1);
  if (awal > 2) hasil.push("…");
  for (let i = awal; i <= akhir; i += 1) hasil.push(i);
  if (akhir < total - 1) hasil.push("…");
  hasil.push(total);
  return hasil;
}
