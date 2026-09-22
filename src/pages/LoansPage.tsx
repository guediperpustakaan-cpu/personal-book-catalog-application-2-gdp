import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Check, Plus, Trash2, Undo2 } from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { SkeletonBaris } from "@/components/ui/LoadingSkeleton";
import { Modal } from "@/components/ui/Modal";
import { ChipInfo } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  useBuku,
  useHapusPinjaman,
  usePeminjaman,
  useSimpanPinjaman,
  useUbahPinjaman,
} from "@/hooks/useLibrary";
import { deskripsiJatuhTempo, formatTanggal, selisihHari, toDateInput } from "@/lib/format";
import { validasiPeminjaman, type KesalahanPeminjaman } from "@/utils/validation";
import { pesanError } from "@/utils/error";
import type { LoanWithBook } from "@/types";

type Tab = "aktif" | "terlambat" | "riwayat";

function terlambat(pinjaman: LoanWithBook): boolean {
  return pinjaman.status === "dipinjam" && selisihHari(pinjaman.dueAt) < 0;
}

export default function LoansPage() {
  const toast = useToast();
  const { data: pinjaman = [], isLoading } = usePeminjaman();
  const { data: halamanBuku } = useBuku({
    search: "",
    categoryId: "",
    locationId: "",
    condition: "",
    readingStatus: "",
    ownershipStatus: "",
    sort: "title",
    direction: "asc",
    page: 1,
    pageSize: 200,
  });

  const simpan = useSimpanPinjaman();
  const ubah = useUbahPinjaman();
  const hapus = useHapusPinjaman();

  const [tab, setTab] = useState<Tab>("aktif");
  const [modalBuka, setModalBuka] = useState(false);
  const [perpanjang, setPerpanjang] = useState<LoanWithBook | null>(null);
  const [tanggalBaru, setTanggalBaru] = useState("");
  const [dihapus, setDihapus] = useState<LoanWithBook | null>(null);

  const [form, setForm] = useState({
    bookId: "",
    borrowerName: "",
    borrowerContact: "",
    borrowedAt: toDateInput(new Date()),
    dueAt: toDateInput(new Date(Date.now() + 14 * 86400000)),
    notes: "",
  });
  const [error, setError] = useState<KesalahanPeminjaman>({});

  const aktif = pinjaman.filter((p) => p.status === "dipinjam" && !terlambat(p));
  const terlambatList = pinjaman.filter(terlambat);
  const riwayat = pinjaman.filter((p) => p.status === "dikembalikan");

  const daftar = tab === "aktif" ? aktif : tab === "terlambat" ? terlambatList : riwayat;

  const judulBuku = useMemo(() => {
    const peta = new Map<string, string>();
    (halamanBuku?.data ?? []).forEach((b) => peta.set(b.id, b.title));
    pinjaman.forEach((p) => peta.set(p.bookId, p.book?.title ?? peta.get(p.bookId) ?? "Buku"));
    return peta;
  }, [halamanBuku, pinjaman]);

  const simpanPinjaman = async () => {
    const kesalahan = validasiPeminjaman(form);
    if (Object.keys(kesalahan).length > 0) {
      setError(kesalahan);
      toast.peringatan("Formulir belum lengkap", "Periksa kembali kolom yang bertanda merah.");
      return;
    }
    try {
      await simpan.mutateAsync({
        bookId: form.bookId,
        borrowerName: form.borrowerName,
        borrowerContact: form.borrowerContact || null,
        borrowedAt: form.borrowedAt,
        dueAt: form.dueAt,
        notes: form.notes || null,
      });
      toast.sukses("Peminjaman dicatat", `Buku dicatat dipinjam oleh ${form.borrowerName}.`);
      setModalBuka(false);
      setError({});
      setForm({
        bookId: "",
        borrowerName: "",
        borrowerContact: "",
        borrowedAt: toDateInput(new Date()),
        dueAt: toDateInput(new Date(Date.now() + 14 * 86400000)),
        notes: "",
      });
    } catch (err) {
      toast.gagal("Gagal menyimpan peminjaman", pesanError(err));
    }
  };

  const tandaiKembali = async (p: LoanWithBook) => {
    try {
      await ubah.mutateAsync({
        id: p.id,
        input: { status: "dikembalikan", returnedAt: new Date().toISOString() },
      });
      toast.sukses("Buku dikembalikan", `Terima kasih, ${p.borrowerName} sudah mengembalikan buku.`);
    } catch (err) {
      toast.gagal("Gagal memperbarui data", pesanError(err));
    }
  };

  const simpanPerpanjangan = async () => {
    if (!perpanjang || !tanggalBaru) return;
    if (tanggalBaru < perpanjang.borrowedAt.slice(0, 10)) {
      toast.peringatan(
        "Tanggal tidak sesuai",
        "Tanggal pengembalian baru tidak boleh lebih awal dari tanggal dipinjam."
      );
      return;
    }
    try {
      await ubah.mutateAsync({ id: perpanjang.id, input: { dueAt: tanggalBaru } });
      toast.sukses("Batas waktu diperpanjang", `Hingga ${formatTanggal(tanggalBaru)}.`);
      setPerpanjang(null);
    } catch (err) {
      toast.gagal("Gagal memperpanjang", pesanError(err));
    }
  };

  const konfirmasiHapus = async () => {
    if (!dihapus) return;
    try {
      await hapus.mutateAsync(dihapus.id);
      toast.sukses("Catatan dihapus", "Riwayat peminjaman tersebut dihapus.");
      setDihapus(null);
    } catch (err) {
      toast.gagal("Gagal menghapus catatan", pesanError(err));
    }
  };

  const tabDefinisi: { nilai: Tab; label: string; jumlah: number }[] = [
    { nilai: "aktif", label: "Sedang dipinjam", jumlah: aktif.length },
    { nilai: "terlambat", label: "Terlambat", jumlah: terlambatList.length },
    { nilai: "riwayat", label: "Sudah dikembalikan", jumlah: riwayat.length },
  ];

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader
          judul="Peminjaman buku"
          deskripsi="Catat buku yang Anda pinjamkan kepada orang lain."
          aksi={
            <Button ukuran="kecil" ikon={<Plus className="h-4 w-4" />} onClick={() => setModalBuka(true)}>
              Catat peminjaman
            </Button>
          }
        />
        <CardBody className="pb-0">
          <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Status peminjaman">
            {tabDefinisi.map((t) => (
              <button
                key={t.nilai}
                type="button"
                role="tab"
                aria-selected={tab === t.nilai}
                onClick={() => setTab(t.nilai)}
                className={`whitespace-nowrap rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t.nilai
                    ? "border-b-2 border-indigo-600 text-indigo-700 dark:text-indigo-400"
                    : "border-b-2 border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                }`}
              >
                {t.label}
                <span className="ml-1.5 rounded-full bg-stone-100 px-1.5 py-0.5 text-xs font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  {t.jumlah}
                </span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <SkeletonBaris jumlah={4} />
      ) : daftar.length === 0 ? (
        <EmptyState
          judul={
            tab === "terlambat"
              ? "Tidak ada buku yang terlambat"
              : tab === "riwayat"
                ? "Belum ada riwayat pengembalian"
                : "Belum ada buku yang dipinjamkan"
          }
          pesan={
            tab === "aktif"
              ? "Catat peminjaman agar Anda ingat buku apa saja yang berada di tangan orang lain."
              : "Data akan muncul di sini secara otomatis."
          }
          aksi={
            tab === "aktif" ? (
              <Button ikon={<Plus className="h-4 w-4" />} onClick={() => setModalBuka(true)}>
                Catat peminjaman
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {daftar.map((p) => {
            const lambat = terlambat(p);
            return (
              <li
                key={p.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <div className="w-10 shrink-0">
                    <BookCover
                      judul={p.book?.title ?? "Buku"}
                      url={p.book?.coverThumbUrl ?? p.book?.coverImageUrl}
                      ukuran="kecil"
                      className="h-14 w-10"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/buku/${p.bookId}`}
                        className="truncate text-sm font-semibold text-stone-900 hover:underline dark:text-stone-50"
                      >
                        {judulBuku.get(p.bookId) ?? p.book?.title ?? "Buku tidak ditemukan"}
                      </Link>
                      {p.status === "dikembalikan" ? (
                        <ChipInfo warna="hijau">✓ Sudah dikembalikan</ChipInfo>
                      ) : lambat ? (
                        <ChipInfo warna="merah">⚠ Terlambat</ChipInfo>
                      ) : (
                        <ChipInfo warna="biru">⇄ Sedang dipinjam</ChipInfo>
                      )}
                    </div>
                    <dl className="mt-1.5 grid gap-x-6 gap-y-1 text-xs text-stone-500 sm:grid-cols-2 dark:text-stone-400">
                      <div>
                        <dt className="inline font-medium text-stone-600 dark:text-stone-300">
                          Peminjam:{" "}
                        </dt>
                        <dd className="inline">
                          {p.borrowerName}
                          {p.borrowerContact ? ` · ${p.borrowerContact}` : ""}
                        </dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-stone-600 dark:text-stone-300">
                          Dipinjam:{" "}
                        </dt>
                        <dd className="inline">{formatTanggal(p.borrowedAt)}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-stone-600 dark:text-stone-300">
                          Batas kembali:{" "}
                        </dt>
                        <dd className="inline">{formatTanggal(p.dueAt)}</dd>
                      </div>
                      {p.status === "dipinjam" && (
                        <div>
                          <dt className="inline font-medium text-stone-600 dark:text-stone-300">
                            Keterangan:{" "}
                          </dt>
                          <dd className="inline">{deskripsiJatuhTempo(p.dueAt)}</dd>
                        </div>
                      )}
                      {p.returnedAt && (
                        <div>
                          <dt className="inline font-medium text-stone-600 dark:text-stone-300">
                            Dikembalikan:{" "}
                          </dt>
                          <dd className="inline">{formatTanggal(p.returnedAt)}</dd>
                        </div>
                      )}
                    </dl>
                    {p.notes && (
                      <p className="mt-1.5 text-xs italic text-stone-400 dark:text-stone-500">
                        {p.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">
                    {p.status === "dipinjam" && (
                      <>
                        <Button
                          ukuran="kecil"
                          ikon={<Check className="h-4 w-4" />}
                          onClick={() => void tandaiKembali(p)}
                          disabled={ubah.isPending}
                        >
                          Sudah dikembalikan
                        </Button>
                        <Button
                          variasi="garis"
                          ukuran="kecil"
                          ikon={<CalendarClock className="h-4 w-4" />}
                          onClick={() => {
                            setPerpanjang(p);
                            setTanggalBaru(p.dueAt.slice(0, 10));
                          }}
                        >
                          Perpanjang
                        </Button>
                      </>
                    )}
                    {p.status === "dikembalikan" && (
                      <Button
                        variasi="garis"
                        ukuran="kecil"
                        ikon={<Undo2 className="h-4 w-4" />}
                        onClick={() =>
                          void ubah
                            .mutateAsync({ id: p.id, input: { status: "dipinjam", returnedAt: null } })
                            .then(() => toast.info("Dikembalikan ke status dipinjam"))
                            .catch((err) => toast.gagal("Gagal membatalkan", pesanError(err)))
                        }
                      >
                        Batalkan pengembalian
                      </Button>
                    )}
                    <Button
                      variasi="hantu"
                      ukuran="kecil"
                      ikon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setDihapus(p)}
                      aria-label={`Hapus catatan peminjaman ${p.borrowerName}`}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        terbuka={modalBuka}
        tutup={() => setModalBuka(false)}
        judul="Catat peminjaman buku"
        deskripsi="Isi data peminjam dan batas waktu pengembalian."
        aksi={
          <>
            <Button variasi="garis" onClick={() => setModalBuka(false)}>
              Batal
            </Button>
            <Button onClick={() => void simpanPinjaman()} memuat={simpan.isPending}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Buku" htmlFor="pinjam-buku" wajib pesanError={error.bookId} className="sm:col-span-2">
            <Select
              id="pinjam-buku"
              value={form.bookId}
              onChange={(e) => setForm({ ...form, bookId: e.target.value })}
              pesanError={error.bookId}
            >
              <option value="">Pilih buku</option>
              {(halamanBuku?.data ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                  {b.author ? ` — ${b.author}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nama peminjam" htmlFor="pinjam-nama" wajib pesanError={error.borrowerName}>
            <Input
              id="pinjam-nama"
              value={form.borrowerName}
              onChange={(e) => setForm({ ...form, borrowerName: e.target.value })}
              pesanError={error.borrowerName}
              placeholder="misal Rani Kusuma"
            />
          </Field>
          <Field
            label="Nomor kontak"
            htmlFor="pinjam-kontak"
            petunjuk="Boleh dikosongkan."
          >
            <Input
              id="pinjam-kontak"
              value={form.borrowerContact}
              onChange={(e) => setForm({ ...form, borrowerContact: e.target.value })}
              placeholder="0812-3456-7890"
              inputMode="tel"
            />
          </Field>
          <Field label="Tanggal dipinjam" htmlFor="pinjam-tanggal" wajib pesanError={error.borrowedAt}>
            <Input
              id="pinjam-tanggal"
              type="date"
              value={form.borrowedAt}
              onChange={(e) => setForm({ ...form, borrowedAt: e.target.value })}
              pesanError={error.borrowedAt}
            />
          </Field>
          <Field
            label="Batas waktu pengembalian"
            htmlFor="pinjam-batas"
            wajib
            pesanError={error.dueAt}
          >
            <Input
              id="pinjam-batas"
              type="date"
              value={form.dueAt}
              onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
              pesanError={error.dueAt}
            />
          </Field>
          <Field label="Catatan" htmlFor="pinjam-catatan" className="sm:col-span-2">
            <Textarea
              id="pinjam-catatan"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="min-h-16"
              placeholder="misal untuk tugas kuliah"
            />
          </Field>
        </div>
      </Modal>

      <Modal
        terbuka={Boolean(perpanjang)}
        tutup={() => setPerpanjang(null)}
        judul="Perpanjang tanggal pengembalian"
        ukuran="kecil"
        aksi={
          <>
            <Button variasi="garis" onClick={() => setPerpanjang(null)}>
              Batal
            </Button>
            <Button onClick={() => void simpanPerpanjangan()} memuat={ubah.isPending}>
              Simpan tanggal baru
            </Button>
          </>
        }
      >
        <Field
          label="Batas waktu baru"
          htmlFor="perpanjang-tanggal"
          petunjuk={`Batas saat ini: ${formatTanggal(perpanjang?.dueAt)}`}
        >
          <Input
            id="perpanjang-tanggal"
            type="date"
            value={tanggalBaru}
            onChange={(e) => setTanggalBaru(e.target.value)}
          />
        </Field>
      </Modal>

      <ConfirmDialog
        terbuka={Boolean(dihapus)}
        tutup={() => setDihapus(null)}
        judul="Hapus catatan peminjaman?"
        pesan={`Catatan peminjaman untuk ${dihapus?.borrowerName} akan dihapus. Data buku tetap aman.`}
        memuat={hapus.isPending}
        onKonfirmasi={() => void konfirmasiHapus()}
      />
    </div>
  );
}
