import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { TampilanRating } from "@/components/ui/RatingInput";
import { ConditionBadge, OwnershipBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { formatAngka, formatTanggalPendek } from "@/lib/format";
import type { Book, Category, StorageLocation } from "@/types";

/** Tampilan tabel/daftar alternatif dengan scroll horizontal pada layar kecil. */
export function BookTable({
  daftar,
  kategori,
  lokasi,
  onHapus,
}: {
  daftar: Book[];
  kategori: Record<string, Category>;
  lokasi: Record<string, StorageLocation>;
  onHapus: (buku: Book) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <caption className="sr-only">Daftar koleksi buku</caption>
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400">
            <th scope="col" className="px-4 py-3 font-medium">Judul</th>
            <th scope="col" className="px-4 py-3 font-medium">Kategori</th>
            <th scope="col" className="px-4 py-3 font-medium">Lokasi</th>
            <th scope="col" className="px-4 py-3 font-medium">Status baca</th>
            <th scope="col" className="px-4 py-3 font-medium">Kepemilikan</th>
            <th scope="col" className="px-4 py-3 font-medium">Kondisi</th>
            <th scope="col" className="px-4 py-3 font-medium">Rating</th>
            <th scope="col" className="px-4 py-3 font-medium">Ditambahkan</th>
            <th scope="col" className="px-4 py-3 text-right font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {daftar.map((buku) => (
            <tr
              key={buku.id}
              className="border-b border-stone-100 last:border-0 hover:bg-stone-50/70 dark:border-stone-800/70 dark:hover:bg-stone-800/40"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 shrink-0">
                    <BookCover
                      judul={buku.title}
                      url={buku.coverThumbUrl ?? buku.coverImageUrl}
                      ukuran="kecil"
                      className="h-14 w-10"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/buku/${buku.id}`}
                      className="line-clamp-1 font-medium text-stone-900 hover:underline dark:text-stone-50"
                    >
                      {buku.title}
                    </Link>
                    <p className="line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
                      {buku.author ?? "-"}
                      {buku.publicationYear ? ` · ${buku.publicationYear}` : ""}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                {buku.categoryId ? kategori[buku.categoryId]?.name ?? "-" : "-"}
              </td>
              <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                {buku.storageLocationId ? lokasi[buku.storageLocationId]?.name ?? "-" : "-"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={buku.readingStatus} />
              </td>
              <td className="px-4 py-3">
                <OwnershipBadge status={buku.ownershipStatus} />
              </td>
              <td className="px-4 py-3">
                <ConditionBadge kondisi={buku.condition} />
              </td>
              <td className="px-4 py-3">
                <TampilanRating nilai={buku.rating} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-stone-600 dark:text-stone-300">
                {formatTanggalPendek(buku.createdAt)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    to={`/buku/${buku.id}/edit`}
                    className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                    aria-label={`Ubah buku ${buku.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onHapus(buku)}
                    className="rounded-lg p-2 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                    aria-label={`Hapus buku ${buku.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-stone-200 px-4 py-2 text-xs text-stone-400 dark:border-stone-800">
        Menampilkan {formatAngka(daftar.length)} buku. Geser tabel ke samping untuk melihat kolom
        lainnya.
      </p>
    </div>
  );
}
