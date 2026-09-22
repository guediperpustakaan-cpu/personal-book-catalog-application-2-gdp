import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export interface PropKonfirmasi {
  terbuka: boolean;
  tutup: () => void;
  judul: string;
  pesan: string;
  teksKonfirmasi?: string;
  teksBatal?: string;
  berbahaya?: boolean;
  memuat?: boolean;
  onKonfirmasi: () => void;
}

/** Dialog konfirmasi sebelum menghapus atau melakukan aksi berisiko. */
export function ConfirmDialog({
  terbuka,
  tutup,
  judul,
  pesan,
  teksKonfirmasi = "Ya, hapus",
  teksBatal = "Batal",
  berbahaya = true,
  memuat = false,
  onKonfirmasi,
}: PropKonfirmasi) {
  return (
    <Modal
      terbuka={terbuka}
      tutup={tutup}
      judul={judul}
      ukuran="kecil"
      aksi={
        <>
          <Button variasi="garis" onClick={tutup} disabled={memuat}>
            {teksBatal}
          </Button>
          <Button
            variasi={berbahaya ? "bahaya" : "utama"}
            onClick={onKonfirmasi}
            memuat={memuat}
          >
            {teksKonfirmasi}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span
          className={
            berbahaya
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
          }
          aria-hidden="true"
        >
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">{pesan}</p>
      </div>
    </Modal>
  );
}
