import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBaris } from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  useHapusKategori,
  useKategori,
  useSimpanKategori,
  useUbahKategori,
} from "@/hooks/useLibrary";
import { useKoleksiPenuh } from "@/hooks/useStats";
import { formatAngka } from "@/lib/format";
import { pesanError } from "@/utils/error";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const toast = useToast();
  const { data: kategori = [], isLoading } = useKategori();
  const { data: buku = [] } = useKoleksiPenuh();
  const simpan = useSimpanKategori();
  const ubah = useUbahKategori();
  const hapus = useHapusKategori();

  const [modalBuka, setModalBuka] = useState<"tambah" | "ubah" | null>(null);
  const [nama, setNama] = useState("");
  const [target, setTarget] = useState<Category | null>(null);
  const [dihapus, setDihapus] = useState<Category | null>(null);

  const jumlahBuku = useMemo(() => {
    const peta = new Map<string, number>();
    buku.forEach((b) => {
      if (b.categoryId) peta.set(b.categoryId, (peta.get(b.categoryId) ?? 0) + 1);
    });
    return peta;
  }, [buku]);

  const bukaTambah = () => {
    setNama("");
    setTarget(null);
    setModalBuka("tambah");
  };

  const bukaUbah = (item: Category) => {
    setNama(item.name);
    setTarget(item);
    setModalBuka("ubah");
  };

  const simpanKategori = async () => {
    const bersih = nama.trim();
    if (!bersih) {
      toast.peringatan("Nama kategori kosong", "Tulis nama kategori terlebih dahulu.");
      return;
    }
    try {
      if (modalBuka === "ubah" && target) {
        await ubah.mutateAsync({ id: target.id, nama: bersih });
        toast.sukses("Kategori diubah", `Nama kategori menjadi "${bersih}".`);
      } else {
        await simpan.mutateAsync(bersih);
        toast.sukses("Kategori ditambahkan", `"${bersih}" siap dipakai.`);
      }
      setModalBuka(null);
      setNama("");
    } catch (err) {
      toast.gagal("Gagal menyimpan kategori", pesanError(err));
    }
  };

  const konfirmasiHapus = async () => {
    if (!dihapus) return;
    if ((jumlahBuku.get(dihapus.id) ?? 0) > 0) {
      toast.peringatan(
        "Kategori masih dipakai",
        `Pindahkan ${formatAngka(jumlahBuku.get(dihapus.id) ?? 0)} buku ke kategori lain terlebih dahulu.`
      );
      setDihapus(null);
      return;
    }
    try {
      await hapus.mutateAsync(dihapus.id);
      toast.sukses("Kategori dihapus", `"${dihapus.name}" dihapus dari daftar.`);
      setDihapus(null);
    } catch (err) {
      toast.gagal("Gagal menghapus kategori", pesanError(err));
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          judul="Kelola kategori"
          deskripsi="Kelompokkan buku agar koleksi lebih mudah dicari."
          aksi={
            <Button ukuran="kecil" ikon={<Plus className="h-4 w-4" />} onClick={bukaTambah}>
              Tambah kategori
            </Button>
          }
        />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5">
              <SkeletonBaris jumlah={6} />
            </div>
          ) : kategori.length === 0 ? (
            <div className="p-5">
              <EmptyState
                ikon={<Tags className="h-7 w-7" />}
                judul="Belum ada kategori"
                pesan="Buat kategori pertama Anda, misalnya Fiksi atau Teknologi."
                aksi={
                  <Button ikon={<Plus className="h-4 w-4" />} onClick={bukaTambah}>
                    Tambah kategori
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {kategori.map((item) => {
                const jumlah = jumlahBuku.get(item.id) ?? 0;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      <Tags className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {formatAngka(jumlah)} buku
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        to={`/koleksi?kategori=${item.id}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                      >
                        Lihat buku
                      </Link>
                      <button
                        type="button"
                        onClick={() => bukaUbah(item)}
                        aria-label={`Ubah kategori ${item.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDihapus(item)}
                        aria-label={`Hapus kategori ${item.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        terbuka={modalBuka !== null}
        tutup={() => setModalBuka(null)}
        judul={modalBuka === "ubah" ? "Ubah nama kategori" : "Tambah kategori"}
        ukuran="kecil"
        aksi={
          <>
            <Button variasi="garis" onClick={() => setModalBuka(null)}>
              Batal
            </Button>
            <Button
              onClick={() => void simpanKategori()}
              memuat={simpan.isPending || ubah.isPending}
              disabled={!nama.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <Field label="Nama kategori" htmlFor="nama-kategori" wajib>
          <Input
            id="nama-kategori"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="misal Sejarah"
            maxLength={60}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        terbuka={Boolean(dihapus)}
        tutup={() => setDihapus(null)}
        judul="Hapus kategori ini?"
        pesan={
          dihapus && (jumlahBuku.get(dihapus.id) ?? 0) > 0
            ? `Kategori "${dihapus.name}" masih dipakai ${formatAngka(
                jumlahBuku.get(dihapus.id) ?? 0
              )} buku. Pindahkan buku-buku tersebut terlebih dahulu.`
            : `Kategori "${dihapus?.name}" akan dihapus. Buku yang memakai kategori ini tidak ikut terhapus.`
        }
        memuat={hapus.isPending}
        onKonfirmasi={() => void konfirmasiHapus()}
      />
    </div>
  );
}
