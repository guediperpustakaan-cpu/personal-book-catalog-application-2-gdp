import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Kolom pencarian dengan debounce agar database tidak dipanggil
 * setiap kali pengguna mengetik satu huruf.
 */
export function SearchBar({
  nilai,
  ubah,
  placeholder = "Cari judul, penulis, ISBN, atau catatan…",
  jeda = 400,
}: {
  nilai: string;
  ubah: (nilai: string) => void;
  placeholder?: string;
  jeda?: number;
}) {
  const [lokal, setLokal] = useState(nilai);
  const tunda = useDebounce(lokal, jeda);

  useEffect(() => {
    setLokal(nilai);
  }, [nilai]);

  useEffect(() => {
    if (tunda !== nilai) ubah(tunda);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tunda]);

  return (
    <div className="relative w-full">
      <label htmlFor="cari-buku" className="sr-only">
        Cari buku
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
        aria-hidden="true"
      />
      <input
        id="cari-buku"
        type="search"
        value={lokal}
        onChange={(e) => setLokal(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-stone-300 bg-white pl-10 pr-10 text-sm text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-50"
      />
      {lokal && (
        <button
          type="button"
          onClick={() => {
            setLokal("");
            ubah("");
          }}
          aria-label="Hapus kata pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
