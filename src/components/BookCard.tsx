import { memo } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/ui/Button";
import { OwnershipBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { TampilanRating } from "@/components/ui/RatingInput";
import { potongTeks } from "@/lib/format";
import type { Book, Category, StorageLocation } from "@/types";

interface PropKartuBuku {
  buku: Book;
  kategori?: Category;
  lokasi?: StorageLocation;
  onHapus: (buku: Book) => void;
}

/** Kartu buku untuk tampilan grid. */
export const BookCard = memo(function BookCard({
  buku,
  kategori,
  lokasi,
  onHapus,
}: PropKartuBuku) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-900/5 transition-shadow hover:shadow-md dark:border-stone-800 dark:bg-stone-900">
      <Link
        to={`/buku/${buku.id}`}
        className="relative block overflow-hidden bg-stone-100 p-2 dark:bg-stone-800/60"
        aria-label={`Lihat detail ${buku.title}`}
      >
        <BookCover judul={buku.title} url={buku.coverThumbUrl ?? buku.coverImageUrl} />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stone-900 dark:text-stone-50">
            <Link to={`/buku/${buku.id}`} className="hover:underline">
              {buku.title}
            </Link>
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-stone-500 dark:text-stone-400">
            {buku.author ?? "Penulis tidak diketahui"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={buku.readingStatus} />
          {buku.ownershipStatus === "dipinjamkan" && (
            <OwnershipBadge status={buku.ownershipStatus} />
          )}
        </div>

        <dl className="space-y-1 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Kategori</dt>
            <dd className="truncate">
              🏷️ {kategori?.name ?? "Tanpa kategori"}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Lokasi</dt>
            <dd className="truncate">📍 {lokasi?.name ?? "Lokasi belum diatur"}</dd>
          </div>
        </dl>

        {buku.notes && (
          <p className="text-xs italic text-stone-400 dark:text-stone-500">
            {potongTeks(buku.notes, 60)}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <TampilanRating nilai={buku.rating} />
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-60 sm:transition-opacity sm:group-hover:opacity-100">
            <Link
              to={`/buku/${buku.id}`}
              className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              aria-label={`Lihat detail ${buku.title}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/buku/${buku.id}/edit`}
              className="rounded-lg p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              aria-label={`Ubah ${buku.title}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => onHapus(buku)}
              className="rounded-lg p-1.5 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
              aria-label={`Hapus ${buku.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});

export function BookCardAksi({ onTambah }: { onTambah: () => void }) {
  return (
    <Button onClick={onTambah} className="w-full">
      Tambah buku pertama
    </Button>
  );
}
