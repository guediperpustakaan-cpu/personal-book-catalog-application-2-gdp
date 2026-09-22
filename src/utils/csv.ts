import { BOOK_CONDITION_LABEL, OWNERSHIP_STATUS_LABEL, READING_STATUS_LABEL } from "@/lib/constants";
import { toDateInput } from "@/lib/format";
import type { Book, BookCondition, OwnershipStatus, ReadingStatus } from "@/types";

export interface BarisCsv {
  judul: string;
  penulis: string;
  isbn: string;
  penerbit: string;
  tahun: string;
  edisi: string;
  bahasa: string;
  kategori: string;
  deskripsi: string;
  jumlah_halaman: string;
  kondisi: string;
  lokasi: string;
  status_baca: string;
  kepemilikan: string;
  rating: string;
  catatan: string;
  tanggal_diperoleh: string;
}

export const HEADER_CSV: (keyof BarisCsv)[] = [
  "judul",
  "penulis",
  "isbn",
  "penerbit",
  "tahun",
  "edisi",
  "bahasa",
  "kategori",
  "deskripsi",
  "jumlah_halaman",
  "kondisi",
  "lokasi",
  "status_baca",
  "kepemilikan",
  "rating",
  "catatan",
  "tanggal_diperoleh",
];

function escapeCsv(nilai: unknown): string {
  const teks = nilai === null || nilai === undefined ? "" : String(nilai);
  if (/[",\n;]/.test(teks)) {
    return `"${teks.replace(/"/g, '""')}"`;
  }
  return teks;
}

export function keCsv(baris: Record<string, unknown>[], header?: string[]): string {
  if (!baris.length) return (header ?? []).join(",") + "\n";
  const kolom = header ?? Object.keys(baris[0]);
  const isi = baris.map((b) => kolom.map((k) => escapeCsv(b[k])).join(","));
  return [kolom.join(","), ...isi].join("\r\n") + "\r\n";
}

export function unduhTeks(namaFile: string, isi: string, tipe = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + isi], { type: tipe });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parser CSV sederhana yang mendukung tanda kutip dan pemisah koma/titik koma. */
export function parseCsv(teks: string): string[][] {
  const bersih = teks.replace(/^\uFEFF/, "");
  const pemisah = (bersih.split("\n")[0]?.includes(";") && !bersih.split("\n")[0]?.includes(",")) ? ";" : ",";
  const baris: string[][] = [];
  let sel = "";
  let barisSekarang: string[] = [];
  let dalamKutip = false;

  for (let i = 0; i < bersih.length; i += 1) {
    const huruf = bersih[i];
    if (dalamKutip) {
      if (huruf === '"') {
        if (bersih[i + 1] === '"') {
          sel += '"';
          i += 1;
        } else {
          dalamKutip = false;
        }
      } else {
        sel += huruf;
      }
      continue;
    }
    if (huruf === '"') {
      dalamKutip = true;
    } else if (huruf === pemisah) {
      barisSekarang.push(sel);
      sel = "";
    } else if (huruf === "\n") {
      barisSekarang.push(sel);
      baris.push(barisSekarang);
      barisSekarang = [];
      sel = "";
    } else if (huruf !== "\r") {
      sel += huruf;
    }
  }
  if (sel.length || barisSekarang.length) {
    barisSekarang.push(sel);
    baris.push(barisSekarang);
  }
  return baris.filter((b) => b.some((s) => s.trim() !== ""));
}

/** Normalisasi label Indonesia -> nilai enum internal. */
function keEnum<T extends string>(nilai: string, daftar: Record<string, string>): T | null {
  const kunci = (nilai ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (!kunci) return null;
  const cocok = Object.entries(daftar).find(
    ([key, label]) => key === kunci || label.toLowerCase() === nilai.trim().toLowerCase()
  );
  return (cocok?.[0] as T) ?? null;
}

export interface HasilImpor {
  valid: BarisBukuSiapSimpan[];
  error: { baris: number; pesan: string; data: Record<string, string> }[];
}

/** Ubah isi CSV menjadi struktur siap preview, tanpa menggagalkan baris lain. */
export interface BarisBukuSiapSimpan {
  judul: string;
  penulis: string | null;
  isbn: string | null;
  penerbit: string | null;
  publicationYear: number | null;
  edition: string | null;
  language: string | null;
  categoryId: string | null;
  storageLocationId: string | null;
  description: string | null;
  pageCount: number | null;
  condition: BookCondition | null;
  readingStatus: ReadingStatus | null;
  ownershipStatus: OwnershipStatus | null;
  rating: number | null;
  notes: string | null;
  acquiredDate: string | null;
}

export function csvKeBuku(
  teks: string,
  kategoriTersedia: { id: string; name: string }[],
  lokasiTersedia: { id: string; name: string }[]
): HasilImpor {
  const hasil: HasilImpor = { valid: [], error: [] };
  const cariId = (daftar: { id: string; name: string }[], nama: string) => {
    const kunci = nama.trim().toLowerCase();
    return daftar.find((d) => d.name.trim().toLowerCase() === kunci)?.id ?? null;
  };
  const tabel = parseCsv(teks);
  if (tabel.length < 2) {
    hasil.error.push({ baris: 1, pesan: "Berkas CSV kosong atau tidak memiliki data.", data: {} });
    return hasil;
  }

  const header = tabel[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const idxJudul = header.indexOf("judul");
  if (idxJudul === -1) {
    hasil.error.push({
      baris: 1,
      pesan: "Kolom wajib \"judul\" tidak ditemukan pada baris pertama.",
      data: {},
    });
    return hasil;
  }

  const ambil = (row: string[], nama: string) => {
    const i = header.indexOf(nama);
    return i === -1 ? "" : (row[i] ?? "").trim();
  };

  tabel.slice(1).forEach((row, i) => {
    const nomorBaris = i + 2;
    const judul = ambil(row, "judul");
    if (!judul) {
      hasil.error.push({ baris: nomorBaris, pesan: "Judul kosong.", data: { judul } });
      return;
    }
    const tahun = Number(ambil(row, "tahun"));
    const halaman = Number(ambil(row, "jumlah_halaman"));
    const rating = Number(ambil(row, "rating").replace(",", "."));

    hasil.valid.push({
      judul,
      penulis: ambil(row, "penulis") || null,
      isbn: ambil(row, "isbn").replace(/[^0-9Xx]/g, "").toUpperCase() || null,
      penerbit: ambil(row, "penerbit") || null,
      publicationYear: Number.isFinite(tahun) && tahun > 0 ? tahun : null,
      edition: ambil(row, "edisi") || null,
      language: ambil(row, "bahasa") || null,
      categoryId: cariId(kategoriTersedia, ambil(row, "kategori")),
      storageLocationId: cariId(lokasiTersedia, ambil(row, "lokasi")),
      description: ambil(row, "deskripsi") || null,
      pageCount: Number.isFinite(halaman) && halaman > 0 ? Math.round(halaman) : null,
      condition: keEnum<BookCondition>(ambil(row, "kondisi"), BOOK_CONDITION_LABEL),
      readingStatus: keEnum<ReadingStatus>(ambil(row, "status_baca"), READING_STATUS_LABEL),
      ownershipStatus: keEnum<OwnershipStatus>(ambil(row, "kepemilikan"), OWNERSHIP_STATUS_LABEL),
      rating: Number.isFinite(rating) && rating >= 0 && rating <= 5 ? rating : null,
      notes: ambil(row, "catatan") || null,
      acquiredDate: ambil(row, "tanggal_diperoleh") || null,
    });
  });

  return hasil;
}

export type HasilCsvImport = HasilImpor;

/** Template CSV untuk diunduh pengguna. */
export function templateCsv(): string {
  return keCsv(
    [
      {
        judul: "Contoh Judul Buku",
        penulis: "Nama Penulis",
        isbn: "9786020000000",
        penerbit: "Nama Penerbit",
        tahun: "2024",
        edisi: "Cetakan ke-1",
        bahasa: "Indonesia",
        kategori: "Teknologi",
        deskripsi: "Sinopsis singkat buku",
        jumlah_halaman: "240",
        kondisi: "Baik",
        lokasi: "Rak A",
        status_baca: "Sudah dibaca",
        kepemilikan: "Dimiliki",
        rating: "4,5",
        catatan: "Catatan pribadi",
        tanggal_diperoleh: "2025-03-11",
      },
    ],
    HEADER_CSV as unknown as string[]
  );
}

export function bukuKeBarisCsv(
  buku: Book,
  namaKategori: (id: string | null) => string,
  namaLokasi: (id: string | null) => string
): Record<string, string> {
  return {
    judul: buku.title,
    penulis: buku.author ?? "",
    isbn: buku.isbn ?? "",
    penerbit: buku.publisher ?? "",
    tahun: buku.publicationYear ? String(buku.publicationYear) : "",
    edisi: buku.edition ?? "",
    bahasa: buku.language ?? "",
    kategori: namaKategori(buku.categoryId),
    deskripsi: buku.description ?? "",
    jumlah_halaman: buku.pageCount ? String(buku.pageCount) : "",
    kondisi: buku.condition ? BOOK_CONDITION_LABEL[buku.condition] : "",
    lokasi: namaLokasi(buku.storageLocationId),
    status_baca: buku.readingStatus ? READING_STATUS_LABEL[buku.readingStatus] : "",
    kepemilikan: buku.ownershipStatus ? OWNERSHIP_STATUS_LABEL[buku.ownershipStatus] : "",
    rating: buku.rating !== null && buku.rating !== undefined ? String(buku.rating).replace(".", ",") : "",
    catatan: buku.notes ?? "",
    tanggal_diperoleh: toDateInput(buku.acquiredDate),
  };
}
