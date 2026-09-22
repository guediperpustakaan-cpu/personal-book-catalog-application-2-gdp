import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { SkeletonBaris } from "@/components/ui/LoadingSkeleton";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  useHapusLokasi,
  useLokasi,
  useSimpanLokasi,
  useUbahLokasi,
} from "@/hooks/useLibrary";
import { useKoleksiPenuh } from "@/hooks/useStats";
import { formatAngka } from "@/lib/format";
import { pesanError } from "@/utils/error";
import type { StorageLocation } from "@/types";

export default function LocationsPage() {
  const toast = useToast();
  const { data: lokasi = [], isLoading } = useLokasi();
  const { data: buku = [] } = useKoleksiPenuh();
  const simpan = useSimpanLokasi();
  const ubah = useUbahLokasi();
  const hapus = useHapusLokasi();

  const [modalBuka, setModalBuka] = useState<"tambah" | "ubah" | null>(null);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [target, setTarget] = useState<StorageLocation | null>(null);
  const [dihapus, setDihapus] = useState<StorageLocation | null>(null);

  const jumlahBuku = useMemo(() => {
    const peta = new Map<string, number>();
    buku.forEach((b) => {
      if (b.storageLocationId) {
        peta.set(b.storageLocationId, (peta.get(b.storageLocationId) ?? 0) + 1);
      }
    });
    return peta;
  }, [buku]);

  const bukaTambah = () => {
    setNama("");
    setKeterangan("");
    setTarget(null);
    setModalBuka("tambah");
  };

  const bukaUbah = (item: StorageLocation) => {
    setNama(item.name);
    setKeterangan(item.description ?? "");
    setTarget(item);
    setModalBuka("ubah");
  };

  const simpanLokasi = async () => {
    const bersih = nama.trim();
    if (!bersih) {
      toast.peringatan("Nama lokasi kosong", "Tulis nama lokasi terlebih dahulu.");
      return;
    }
    const payload = { name: bersih, description: keterangan.trim() || undefined };
    try {
      if (modalBuka === "ubah" && target) {
        await ubah.mutateAsync({ id: target.id, input: payload });
        toast.sukses("Lokasi diubah", `"${bersih}" berhasil diperbarui.`);
      } else {
        await simpan.mutateAsync(payload);
        toast.sukses("Lokasi ditambahkan", `"${bersih}" siap dipakai.`);
      }
      setModalBuka(null);
      setNama("");
      setKeterangan("");
    } catch (err) {
      toast.gagal("Gagal menyimpan lokasi", pesanError(err));
    }
  };

  const konfirmasiHapus = async () => {
    if (!dihapus) return;
    if ((jumlahBuku.get(dihapus.id) ?? 0) > 0) {
      toast.peringatan(
        "Lokasi masih dipakai",
        `Pindahkan ${formatAngka(jumlahBuku.get(dihapus.id) ?? 0)} buku dari lokasi ini terlebih dahulu.`
      );
      setDihapus(null);
      return;
    }
    try {
      await hapus.mutateAsync(dihapus.id);
      toast.sukses("Lokasi dihapus", `"${dihapus.name}" dihapus dari daftar.`);
      setDihapus(null);
    } catch (err) {
      toast.gagal("Gagal menghapus lokasi", pesanError(err));
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          judul="Lokasi penyimpanan"
          deskripsi="Catat letak fisik buku: rak, lemari, kardus, atau ruangan."
          aksi={
            <Button ukuran="kecil" ikon={<Plus className="h-4 w-4" />} onClick={bukaTambah}>
              Tambah lokasi
            </Button>
          }
        />
        <CardBody className="p-0">
          {isLoading ? (
            <div className="p-5">
              <SkeletonBaris jumlah={6} />
            </div>
          ) : lokasi.length === 0 ? (
            <div className="p-5">
              <EmptyState
                ikon={<MapPin className="h-7 w-7" />}
                judul="Belum ada lokasi"
                pesan="Tambahkan lokasi seperti “Rak A” atau “Kardus 1” agar buku mudah ditemukan."
                aksi={
                  <Button ikon={<Plus className="h-4 w-4" />} onClick={bukaTambah}>
                    Tambah lokasi
                  </Button>
                }
              />
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {lokasi.map((item) => {
                const jumlah = jumlahBuku.get(item.id) ?? 0;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                        {item.name}
                      </p>
                      <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                        {item.description || "Tanpa keterangan"} · {formatAngka(jumlah)} buku
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        to={`/koleksi?lokasi=${item.id}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                      >
                        Lihat buku
                      </Link>
                      <button
                        type="button"
                        onClick={() => bukaUbah(item)}
                        aria-label={`Ubah lokasi ${item.name}`}
                        className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDihapus(item)}
                        aria-label={`Hapus lokasi ${item.name}`}
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
        judul={modalBuka === "ubah" ? "Ubah lokasi" : "Tambah lokasi"}
        ukuran="kecil"
        aksi={
          <>
            <Button variasi="garis" onClick={() => setModalBuka(null)}>
              Batal
            </Button>
            <Button
              onClick={() => void simpanLokasi()}
              memuat={simpan.isPending || ubah.isPending}
              disabled={!nama.trim()}
            >
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama lokasi" htmlFor="nama-lokasi" wajib>
            <Input
              id="nama-lokasi"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="misal Rak B"
              maxLength={60}
            />
          </Field>
          <Field label="Keterangan" htmlFor="keterangan-lokasi" petunjuk="Boleh dikosongkan.">
            <Textarea
              id="keterangan-lokasi"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="min-h-16"
              maxLength={200}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        terbuka={Boolean(dihapus)}
        tutup={() => setDihapus(null)}
        judul="Hapus lokasi ini?"
        pesan={
          dihapus && (jumlahBuku.get(dihapus.id) ?? 0) > 0
            ? `Lokasi "${dihapus.name}" masih berisi ${formatAngka(
                jumlahBuku.get(dihapus.id) ?? 0
              )} buku. Pindahkan buku tersebut terlebih dahulu.`
            : `Lokasi "${dihapus?.name}" akan dihapus. Buku di dalamnya tidak ikut terhapus.`
        }
        memuat={hapus.isPending}
        onKonfirmasi={() => void konfirmasiHapus()}
      />
    </div>
  );
}
