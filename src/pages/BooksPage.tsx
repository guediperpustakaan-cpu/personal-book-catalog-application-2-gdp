import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Plus, ScanBarcode } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { BookTable } from "@/components/BookTable";
import { FilterPanel, type NilaiFilter } from "@/components/FilterPanel";
import { SearchBar } from "@/components/SearchBar";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, EmptyStatePencarian } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonDaftarBuku } from "@/components/ui/LoadingSkeleton";
import { useToast } from "@/components/ui/Toast";
import { useBuku, useHapusBuku, useKategori, useLokasi } from "@/hooks/useLibrary";
import { useKoleksiPenuh } from "@/hooks/useStats";
import { useDebounce } from "@/hooks/useDebounce";
import { formatAngka } from "@/lib/format";
import { pesanError } from "@/utils/error";
import type { Book, BookSortField, SortDirection } from "@/types";

const TAMPILAN_KUNCI = "bukurumah.tampilan";

export default function BooksPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [cari, setCari] = useState(params.get("q") ?? "");
  const cariTunda = useDebounce(cari, 400);
  const [tampilan, setTampilan] = useState<"grid" | "tabel">(() =>
    (localStorage.getItem(TAMPILAN_KUNCI) as "grid" | "tabel") ?? "grid"
  );
  const [bukuDihapus, setBukuDihapus] = useState<Book | null>(null);
  const [scanTerbuka, setScanTerbuka] = useState(params.get("scan") === "1");

  const filter: NilaiFilter = {
    kategori: params.get("kategori") ?? "",
    lokasi: params.get("lokasi") ?? "",
    kondisi: params.get("kondisi") ?? "",
    statusBaca: params.get("status") ?? "",
    kepemilikan: params.get("milik") ?? "",
    urut: (params.get("urut") as BookSortField) ?? "created_at",
    arah: (params.get("arah") as SortDirection) ?? "desc",
    jumlah: Number(params.get("jumlah") ?? 12),
  };
  const halaman = Math.max(1, Number(params.get("halaman") ?? 1));

  const ubahParams = (perubahan: Record<string, string | number | null>) => {
    const berikutnya = new URLSearchParams(params);
    Object.entries(perubahan).forEach(([kunci, nilai]) => {
      if (nilai === null || nilai === "" || nilai === undefined) berikutnya.delete(kunci);
      else berikutnya.set(kunci, String(nilai));
    });
    setParams(berikutnya, { replace: true });
  };

  // Sinkronkan kolom pencarian ke parameter URL (dengan debounce).
  useEffect(() => {
    const saatIni = params.get("q") ?? "";
    if (cariTunda !== saatIni) ubahParams({ q: cariTunda || null, halaman: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cariTunda]);

  useEffect(() => {
    setCari(params.get("q") ?? "");
    if (params.get("scan") === "1") setScanTerbuka(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.get("q"), params.get("scan")]);

  useEffect(() => {
    localStorage.setItem(TAMPILAN_KUNCI, tampilan);
  }, [tampilan]);

  const queryBuku = {
    search: params.get("q") ?? "",
    categoryId: filter.kategori,
    locationId: filter.lokasi,
    condition: filter.kondisi,
    readingStatus: filter.statusBaca,
    ownershipStatus: filter.kepemilikan,
    sort: filter.urut,
    direction: filter.arah,
    page: halaman,
    pageSize: filter.jumlah,
  };

  const { data, isLoading, isFetching, isError, error, refetch } = useBuku(queryBuku);
  const { data: kategori = [] } = useKategori();
  const { data: lokasi = [] } = useLokasi();
  // Total koleksi tanpa filter, untuk keterangan pada panel filter.
  const { data: seluruhBuku = [] } = useKoleksiPenuh();
  const hapus = useHapusBuku();

  const petaKategori = useMemo(
    () => Object.fromEntries(kategori.map((k) => [k.id, k])),
    [kategori]
  );
  const petaLokasi = useMemo(() => Object.fromEntries(lokasi.map((l) => [l.id, l])), [lokasi]);

  const jumlahFilterAktif = [
    filter.kategori,
    filter.lokasi,
    filter.kondisi,
    filter.statusBaca,
    filter.kepemilikan,
  ].filter(Boolean).length;

  const daftarBuku = data?.data ?? [];

  const konfirmasiHapus = async () => {
    if (!bukuDihapus) return;
    try {
      await hapus.mutateAsync(bukuDihapus.id);
      toast.sukses("Buku dihapus", `"${bukuDihapus.title}" dikeluarkan dari koleksi.`);
      setBukuDihapus(null);
    } catch (err) {
      toast.gagal("Gagal menghapus buku", pesanError(err));
    }
  };

  const terapkanScan = (isbn: string) => {
    setScanTerbuka(false);
    navigate(`/buku/tambah?isbn=${encodeURIComponent(isbn)}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar nilai={cari} ubah={setCari} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variasi="garis"
            ikon={<ScanBarcode className="h-4 w-4" />}
            onClick={() => setScanTerbuka(true)}
          >
            Scan
          </Button>
          <Button ikon={<Plus className="h-4 w-4" />} onClick={() => navigate("/buku/tambah")}>
            Tambah Buku
          </Button>
        </div>
      </div>

      <FilterPanel
        nilai={filter}
        ubah={(perubahan) => ubahParams({ ...perubahan, halaman: 1 })}
        kategori={kategori}
        lokasi={lokasi}
        jumlahHasil={data?.total ?? 0}
        totalBuku={Math.max(seluruhBuku.length, data?.total ?? 0)}
        jumlahAktif={jumlahFilterAktif}
        onReset={() =>
          ubahParams({
            kategori: null,
            lokasi: null,
            kondisi: null,
            status: null,
            milik: null,
            urut: null,
            arah: null,
            halaman: 1,
          })
        }
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {isLoading ? "Memuat koleksi…" : `${formatAngka(data?.total ?? 0)} buku ditemukan`}
        </p>
        <div
          role="group"
          aria-label="Pilih tampilan"
          className="flex overflow-hidden rounded-xl border border-stone-300 dark:border-stone-600"
        >
          <button
            type="button"
            onClick={() => setTampilan("grid")}
            aria-pressed={tampilan === "grid"}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              tampilan === "grid"
                ? "bg-indigo-600 text-white"
                : "bg-white text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300"
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Kartu</span>
          </button>
          <button
            type="button"
            onClick={() => setTampilan("tabel")}
            aria-pressed={tampilan === "tabel"}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              tampilan === "tabel"
                ? "bg-indigo-600 text-white"
                : "bg-white text-stone-600 hover:bg-stone-50 dark:bg-stone-900 dark:text-stone-300"
            }`}
          >
            <List className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tabel</span>
          </button>
        </div>
      </div>

      {isError ? (
        <EmptyState
          judul="Gagal memuat koleksi"
          pesan={pesanError(error, "Periksa koneksi Anda lalu coba lagi.")}
          aksi={
            <Button variasi="garis" onClick={() => void refetch()}>
              Coba lagi
            </Button>
          }
        />
      ) : isLoading ? (
        tampilan === "grid" ? (
          <SkeletonDaftarBuku jumlah={filter.jumlah > 12 ? 12 : filter.jumlah} />
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-shimmer h-16 rounded-xl bg-stone-200/70 dark:bg-stone-800/70"
              />
            ))}
          </div>
        )
      ) : daftarBuku.length === 0 ? (
        params.get("q") || jumlahFilterAktif > 0 ? (
          <EmptyStatePencarian pesan="Coba ubah kata pencarian atau atur ulang filter yang aktif." />
        ) : (
          <EmptyState
            judul="Koleksi masih kosong"
            pesan="Catat buku pertama Anda. Isi judul saja sudah cukup untuk memulai."
            aksi={
              <div className="flex flex-wrap justify-center gap-2">
                <Button ikon={<Plus className="h-4 w-4" />} onClick={() => navigate("/buku/tambah")}>
                  Tambah buku pertama
                </Button>
                <Button variasi="garis" ikon={<ScanBarcode className="h-4 w-4" />} onClick={() => setScanTerbuka(true)}>
                  Scan ISBN
                </Button>
              </div>
            }
          />
        )
      ) : tampilan === "grid" ? (
        <div
          className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${
            isFetching ? "opacity-70 transition-opacity" : ""
          }`}
        >
          {daftarBuku.map((buku) => (
            <BookCard
              key={buku.id}
              buku={buku}
              kategori={buku.categoryId ? petaKategori[buku.categoryId] : undefined}
              lokasi={buku.storageLocationId ? petaLokasi[buku.storageLocationId] : undefined}
              onHapus={setBukuDihapus}
            />
          ))}
        </div>
      ) : (
        <BookTable
          daftar={daftarBuku}
          kategori={petaKategori}
          lokasi={petaLokasi}
          onHapus={setBukuDihapus}
        />
      )}

      {data && (
        <Pagination
          halaman={data.page}
          totalHalaman={data.totalPages}
          totalData={data.total}
          ubahHalaman={(h) => ubahParams({ halaman: h })}
          memuat={isFetching}
        />
      )}

      <Modal
        terbuka={scanTerbuka}
        tutup={() => {
          setScanTerbuka(false);
          if (params.get("scan")) ubahParams({ scan: null });
        }}
        judul="Pindai ISBN buku"
        deskripsi="Arahkan kamera ke barcode di belakang buku, lalu kami carikan datanya."
      >
        <BarcodeScanner onTerdeteksi={terapkanScan} />
      </Modal>

      <ConfirmDialog
        terbuka={Boolean(bukuDihapus)}
        tutup={() => setBukuDihapus(null)}
        judul="Hapus buku ini?"
        pesan={`Buku "${bukuDihapus?.title}" akan dihapus permanen dari koleksi. Tindakan ini tidak dapat dibatalkan.`}
        memuat={hapus.isPending}
        onKonfirmasi={() => void konfirmasiHapus()}
      />
    </div>
  );
}
