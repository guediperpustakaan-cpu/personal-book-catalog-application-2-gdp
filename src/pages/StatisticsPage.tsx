import { BookOpenCheck, CircleDashed, Handshake, Library, Star, Timer } from "lucide-react";
import { DashboardCard } from "@/components/DashboardCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonStatistik } from "@/components/ui/LoadingSkeleton";
import { GrafikBatang, GrafikGaris, GrafikPersen } from "@/components/ui/StatisticsChart";
import { useKoleksiPenuh, useRingkasanKoleksi } from "@/hooks/useStats";
import { formatAngka, formatDesimal, formatPersen } from "@/lib/format";

export default function StatisticsPage() {
  const { isLoading } = useKoleksiPenuh();
  const ringkasan = useRingkasanKoleksi();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStatistik jumlah={6} />
        <SkeletonStatistik jumlah={3} />
      </div>
    );
  }

  if (ringkasan.total === 0) {
    return (
      <EmptyState
        judul="Belum ada data statistik"
        pesan="Tambahkan minimal satu buku untuk melihat ringkasan koleksi Anda."
      />
    );
  }

  const persenDibaca = formatPersen(ringkasan.dibaca, ringkasan.total);

  return (
    <div className="space-y-6">
      <section
        aria-label="Ringkasan angka"
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6"
      >
        <DashboardCard
          label="Total koleksi"
          nilai={formatAngka(ringkasan.total)}
          ikon={<Library className="h-5 w-5" />}
        />
        <DashboardCard
          label="Sudah dibaca"
          nilai={formatAngka(ringkasan.dibaca)}
          ikon={<BookOpenCheck className="h-5 w-5" />}
          warna="emerald"
        />
        <DashboardCard
          label="Sedang dibaca"
          nilai={formatAngka(ringkasan.sedangDibaca)}
          ikon={<Timer className="h-5 w-5" />}
          warna="amber"
        />
        <DashboardCard
          label="Belum dibaca"
          nilai={formatAngka(ringkasan.belumDibaca)}
          ikon={<CircleDashed className="h-5 w-5" />}
          warna="stone"
        />
        <DashboardCard
          label="Dipinjamkan"
          nilai={formatAngka(ringkasan.dipinjamkan)}
          ikon={<Handshake className="h-5 w-5" />}
          warna="sky"
        />
        <DashboardCard
          label="Rata-rata rating"
          nilai={formatDesimal(ringkasan.rataRating)}
          ikon={<Star className="h-5 w-5" />}
          warna="stone"
          petunjuk="Dari buku yang sudah dinilai"
        />
      </section>

      <Card>
        <CardHeader judul="Perkembangan koleksi" deskripsi="Jumlah buku yang ditambahkan 6 bulan terakhir." />
        <CardBody>
          <GrafikGaris data={ringkasan.perBulan} judul="Buku ditambahkan per bulan" />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader judul="Berdasarkan kategori" />
          <CardBody>
            <GrafikBatang data={ringkasan.perKategori} horizontal kosong="Belum ada kategori tercatat" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader judul="Berdasarkan lokasi" />
          <CardBody>
            <GrafikBatang data={ringkasan.perLokasi} horizontal kosong="Belum ada lokasi tercatat" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader judul="Berdasarkan kondisi" />
          <CardBody>
            <GrafikBatang data={ringkasan.perKondisi} kosong="Belum ada kondisi tercatat" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader judul="Berdasarkan tahun terbit" />
          <CardBody>
            <GrafikBatang
              data={ringkasan.perTahun.slice(-12)}
              kosong="Belum ada tahun terbit tercatat"
            />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader judul="Progres membaca" deskripsi="Seberapa banyak koleksi yang sudah Anda tamatkan." />
        <CardBody className="flex flex-wrap items-center gap-8">
          <GrafikPersen nilai={persenDibaca} label="Buku yang sudah selesai dibaca" />
          <GrafikPersen
            nilai={formatPersen(ringkasan.belumDibaca, ringkasan.total)}
            label="Buku yang belum dibaca"
            warna="#f59e0b"
          />
          <GrafikPersen
            nilai={formatPersen(ringkasan.dipinjamkan, ringkasan.total)}
            label="Buku yang sedang dipinjamkan"
            warna="#0ea5e9"
          />
        </CardBody>
      </Card>
    </div>
  );
}
