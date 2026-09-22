import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dataService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import type { Book, Category, StorageLocation } from "@/types";

/**
 * Ambil koleksi (maksimal 500 buku terbaru) untuk kebutuhan statistik.
 * Dipisah dari hook daftar buku agar halaman statistik tidak mengganggu
 * pagination halaman koleksi.
 */
export function useKoleksiPenuh() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["statistik", "koleksi", userId],
    queryFn: async () => {
      const hasil = await dataService.listBooks({
        sort: "created_at",
        direction: "desc",
        page: 1,
        pageSize: 500,
      });
      return hasil.data;
    },
    staleTime: 60_000,
  });
}

export interface RingkasanKoleksi {
  total: number;
  dibaca: number;
  belumDibaca: number;
  sedangDibaca: number;
  dipinjamkan: number;
  rataRating: number;
  perKategori: { label: string; nilai: number }[];
  perLokasi: { label: string; nilai: number }[];
  perKondisi: { label: string; nilai: number }[];
  perTahun: { label: string; nilai: number }[];
  perBulan: { label: string; nilai: number }[];
}

const NAMA_BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export function hitungRingkasan(
  buku: Book[],
  kategori: Category[],
  lokasi: StorageLocation[]
): RingkasanKoleksi {
  const jumlah = (fn: (b: Book) => boolean) => buku.filter(fn).length;

  const kelompok = (peta: Map<string, number>) =>
    [...peta.entries()]
      .map(([label, nilai]) => ({ label, nilai }))
      .sort((a, b) => b.nilai - a.nilai);

  const grupKategori = new Map<string, number>();
  const namaKategori = new Map(kategori.map((k) => [k.id, k.name]));
  buku.forEach((b) => {
    const nama = b.categoryId ? namaKategori.get(b.categoryId) ?? "Tanpa kategori" : "Tanpa kategori";
    grupKategori.set(nama, (grupKategori.get(nama) ?? 0) + 1);
  });

  const grupLokasi = new Map<string, number>();
  const namaLokasi = new Map(lokasi.map((l) => [l.id, l.name]));
  buku.forEach((b) => {
    const nama = b.storageLocationId
      ? namaLokasi.get(b.storageLocationId) ?? "Belum diatur"
      : "Belum diatur";
    grupLokasi.set(nama, (grupLokasi.get(nama) ?? 0) + 1);
  });

  const grupKondisi = new Map<string, number>();
  buku.forEach((b) => {
    const nama = b.condition ?? "Tidak dicatat";
    grupKondisi.set(nama, (grupKondisi.get(nama) ?? 0) + 1);
  });

  const grupTahun = new Map<string, number>();
  buku.forEach((b) => {
    if (b.publicationYear) {
      const kunci = String(b.publicationYear);
      grupTahun.set(kunci, (grupTahun.get(kunci) ?? 0) + 1);
    }
  });

  // Perkembangan koleksi 6 bulan terakhir berdasarkan tanggal ditambahkan.
  const grupBulan = new Map<string, number>();
  const kunciBulan: string[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const kunci = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    kunciBulan.push(kunci);
    grupBulan.set(kunci, 0);
  }
  buku.forEach((b) => {
    const d = new Date(b.createdAt);
    const kunci = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (grupBulan.has(kunci)) grupBulan.set(kunci, (grupBulan.get(kunci) ?? 0) + 1);
  });

  const berating = buku.filter((b) => typeof b.rating === "number" && b.rating > 0);
  const rataRating = berating.length
    ? Math.round((berating.reduce((t, b) => t + (b.rating ?? 0), 0) / berating.length) * 10) / 10
    : 0;

  return {
    total: buku.length,
    dibaca: jumlah((b) => b.readingStatus === "sudah_dibaca"),
    belumDibaca: jumlah((b) => b.readingStatus === "belum_dibaca"),
    sedangDibaca: jumlah((b) => b.readingStatus === "sedang_dibaca"),
    dipinjamkan: jumlah((b) => b.ownershipStatus === "dipinjamkan"),
    rataRating,
    perKategori: kelompok(grupKategori),
    perLokasi: kelompok(grupLokasi),
    perKondisi: kelompok(grupKondisi),
    perTahun: kelompok(grupTahun).sort((a, b) => Number(a.label) - Number(b.label)),
    perBulan: kunciBulan.map((k) => {
      const [tahun, bulan] = k.split("-");
      return {
        label: `${NAMA_BULAN[Number(bulan) - 1]} ${String(tahun).slice(2)}`,
        nilai: grupBulan.get(k) ?? 0,
      };
    }),
  };
}

export function useRingkasanKoleksi() {
  const { data: buku = [] } = useKoleksiPenuh();
  const { data: kategori = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => dataService.listCategories(),
  });
  const { data: lokasi = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: () => dataService.listLocations(),
  });
  return useMemo(() => hitungRingkasan(buku, kategori, lokasi), [buku, kategori, lokasi]);
}
