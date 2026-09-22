import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Boxes,
  CircleDashed,
  Handshake,
  Library,
  Plus,
  ScanBarcode,
  Tags,
} from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { DashboardCard } from "@/components/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBaris, SkeletonStatistik } from "@/components/ui/LoadingSkeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GrafikBatang } from "@/components/ui/StatisticsChart";
import { useKoleksiPenuh, useRingkasanKoleksi } from "@/hooks/useStats";
import { useKategori, useLokasi } from "@/hooks/useLibrary";
import { formatAngka, formatTanggalPendek, formatDesimal } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { pengguna } = useAuth();
  const { isLoading: memuatBuku } = useKoleksiPenuh();
  const ringkasan = useRingkasanKoleksi();
  const { data: kategori = [], isLoading: memuatKategori } = useKategori();
  const { data: lokasi = [], isLoading: memuatLokasi } = useLokasi();

  const { data: buku = [] } = useKoleksiPenuh();
  const baruDitambahkan = buku.slice(0, 5);
  const terakhirDibaca = buku
    .filter((b) => b.readingStatus === "sudah_dibaca")
    .slice(0, 5);

  const memuatSemua = memuatBuku || memuatKategori || memuatLokasi;

  return (
    <div className="space-y-6">
      {/* Sambutan + aksi cepat */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-5 text-white shadow-lg shadow-indigo-600/20 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Selamat datang, {pengguna?.nama ?? "Pembaca"} 👋
            </h2>
            <p className="mt-1 text-sm text-indigo-100">
              Anda memiliki {formatAngka(ringkasan.total)} buku di{" "}
              {formatAngka(lokasi.length)} lokasi penyimpanan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variasi="sekunder"
              className="bg-white text-indigo-700 hover:bg-indigo-50 dark:bg-white dark:text-indigo-700"
              ikon={<Plus className="h-4 w-4" />}
              onClick={() => navigate("/buku/tambah")}
            >
              Tambah Buku
            </Button>
            <Button
              variasi="garis"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 dark:border-white/40"
              ikon={<ScanBarcode className="h-4 w-4" />}
              onClick={() => navigate("/koleksi?scan=1")}
            >
              Scan ISBN
            </Button>
          </div>
        </div>
      </section>

      {memuatSemua ? (
        <SkeletonStatistik jumlah={6} />
      ) : (
        <section
          aria-label="Ringkasan koleksi"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6"
        >
          <DashboardCard
            label="Seluruh buku"
            nilai={formatAngka(ringkasan.total)}
            ikon={<Library className="h-5 w-5" />}
            petunjuk="Total koleksi"
          />
          <DashboardCard
            label="Sudah dibaca"
            nilai={formatAngka(ringkasan.dibaca)}
            ikon={<BookOpenCheck className="h-5 w-5" />}
            warna="emerald"
          />
          <DashboardCard
            label="Belum dibaca"
            nilai={formatAngka(ringkasan.belumDibaca)}
            ikon={<CircleDashed className="h-5 w-5" />}
            warna="amber"
          />
          <DashboardCard
            label="Sedang dipinjamkan"
            nilai={formatAngka(ringkasan.dipinjamkan)}
            ikon={<Handshake className="h-5 w-5" />}
            warna="sky"
            aksi={
              ringkasan.dipinjamkan > 0 ? (
                <Link
                  to="/peminjaman"
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
                >
                  Lihat peminjaman <ArrowRight className="h-3 w-3" />
                </Link>
              ) : undefined
            }
          />
          <DashboardCard
            label="Kategori"
            nilai={formatAngka(kategori.length)}
            ikon={<Tags className="h-5 w-5" />}
            warna="stone"
            aksi={
              <Link
                to="/kategori"
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:underline dark:text-stone-300"
              >
                Kelola kategori <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
          <DashboardCard
            label="Lokasi penyimpanan"
            nilai={formatAngka(lokasi.length)}
            ikon={<Boxes className="h-5 w-5" />}
            warna="stone"
            aksi={
              <Link
                to="/lokasi"
                className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:underline dark:text-stone-300"
              >
                Kelola lokasi <ArrowRight className="h-3 w-3" />
              </Link>
            }
          />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            judul="Buku baru ditambahkan"
            deskripsi="Lima buku terakhir yang Anda catat."
            aksi={
              <Link
                to="/koleksi"
                className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Semua buku <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <CardBody className="p-0">
            {memuatSemua ? (
              <div className="p-5">
                <SkeletonBaris jumlah={4} />
              </div>
            ) : baruDitambahkan.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  judul="Belum ada buku"
                  pesan="Mulai catat buku pertama Anda agar koleksi mudah dikelola."
                  aksi={
                    <Button ikon={<Plus className="h-4 w-4" />} onClick={() => navigate("/buku/tambah")}>
                      Tambah buku
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {baruDitambahkan.map((b) => {
                  const kat = kategori.find((k) => k.id === b.categoryId);
                  return (
                    <li key={b.id}>
                      <Link
                        to={`/buku/${b.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                      >
                        <div className="w-9 shrink-0">
                          <BookCover judul={b.title} url={b.coverThumbUrl ?? b.coverImageUrl} ukuran="kecil" className="h-12 w-9" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                            {b.title}
                          </p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {b.author ?? "Tanpa penulis"} · {kat?.name ?? "Tanpa kategori"}
                          </p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-stone-400 sm:block">
                          {formatTanggalPendek(b.createdAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            judul="Terakhir ditandai selesai dibaca"
            deskripsi="Buku yang sudah Anda tamatkan."
          />
          <CardBody className="p-0">
            {memuatSemua ? (
              <div className="p-5">
                <SkeletonBaris jumlah={4} />
              </div>
            ) : terakhirDibaca.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  ikon={<BookOpen className="h-7 w-7" />}
                  judul="Belum ada buku yang selesai dibaca"
                  pesan="Tandai status membaca pada detail buku untuk melihat riwayat di sini."
                />
              </div>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {terakhirDibaca.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/buku/${b.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50"
                    >
                      <div className="w-9 shrink-0">
                        <BookCover judul={b.title} url={b.coverThumbUrl ?? b.coverImageUrl} ukuran="kecil" className="h-12 w-9" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-50">
                          {b.title}
                        </p>
                        <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                          {b.author ?? "Tanpa penulis"}
                        </p>
                      </div>
                      <StatusBadge status={b.readingStatus} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader judul="Koleksi per kategori" deskripsi="Sebaran buku menurut kelompok." />
          <CardBody>
            <GrafikBatang data={ringkasan.perKategori.slice(0, 8)} horizontal />
          </CardBody>
        </Card>
        <Card>
          <CardHeader judul="Koleksi per lokasi" deskripsi="Di mana buku Anda tersimpan." />
          <CardBody>
            <GrafikBatang data={ringkasan.perLokasi.slice(0, 8)} horizontal />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          judul="Sedang dibaca"
          deskripsi={`Rata-rata rating koleksi Anda: ${formatDesimal(ringkasan.rataRating)} dari 5`}
        />
        <CardBody className="p-0">
          {buku.filter((b) => b.readingStatus === "sedang_dibaca").length === 0 ? (
            <div className="p-5">
              <EmptyState
                judul="Belum ada buku yang sedang dibaca"
                pesan="Ubah status buku menjadi “Sedang dibaca” pada halaman detail buku."
              />
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-stone-800">
              {buku
                .filter((b) => b.readingStatus === "sedang_dibaca")
                .slice(0, 4)
                .map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <Link
                      to={`/buku/${b.id}`}
                      className="truncate text-sm font-medium text-stone-900 hover:underline dark:text-stone-50"
                    >
                      {b.title}
                    </Link>
                    <span className="shrink-0 text-xs text-stone-400">
                      {b.author ?? "-"}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
