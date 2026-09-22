import type {
  BookCondition,
  BookSortField,
  OwnershipStatus,
  ReadingStatus,
} from "@/types";

export const APP_NAME = "BukuRumah";

export const READING_STATUS: ReadingStatus[] = [
  "belum_dibaca",
  "sedang_dibaca",
  "sudah_dibaca",
  "tidak_ingin_dibaca",
];

export const OWNERSHIP_STATUS: OwnershipStatus[] = [
  "dimiliki",
  "dipinjamkan",
  "hilang",
  "ingin_dijual",
  "rusak",
];

export const BOOK_CONDITION: BookCondition[] = [
  "baru",
  "sangat_baik",
  "baik",
  "cukup",
  "rusak",
];

export const READING_STATUS_LABEL: Record<ReadingStatus, string> = {
  belum_dibaca: "Belum dibaca",
  sedang_dibaca: "Sedang dibaca",
  sudah_dibaca: "Sudah dibaca",
  tidak_ingin_dibaca: "Tidak ingin dibaca",
};

export const OWNERSHIP_STATUS_LABEL: Record<OwnershipStatus, string> = {
  dimiliki: "Dimiliki",
  dipinjamkan: "Dipinjamkan",
  hilang: "Hilang",
  ingin_dijual: "Ingin dijual",
  rusak: "Rusak",
};

export const BOOK_CONDITION_LABEL: Record<BookCondition, string> = {
  baru: "Baru",
  sangat_baik: "Sangat baik",
  baik: "Baik",
  cukup: "Cukup",
  rusak: "Rusak",
};

/** Ikon penanda selain warna (aksesibilitas: warna bukan satu-satunya penanda). */
export const READING_STATUS_ICON: Record<ReadingStatus, string> = {
  belum_dibaca: "○",
  sedang_dibaca: "◐",
  sudah_dibaca: "●",
  tidak_ingin_dibaca: "⊘",
};

export const OWNERSHIP_STATUS_ICON: Record<OwnershipStatus, string> = {
  dimiliki: "✓",
  dipinjamkan: "⇄",
  hilang: "✕",
  ingin_dijual: "₽",
  rusak: "⚠",
};

export const SORT_OPTIONS: { value: BookSortField; label: string }[] = [
  { value: "created_at", label: "Tanggal ditambahkan" },
  { value: "title", label: "Judul" },
  { value: "author", label: "Penulis" },
  { value: "publication_year", label: "Tahun terbit" },
  { value: "rating", label: "Rating" },
];

export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

export const LANGUAGES = [
  "Indonesia",
  "Inggris",
  "Jawa",
  "Sunda",
  "Arab",
  "Mandarin",
  "Jepang",
  "Lainnya",
];

export const COVER_BUCKET = "covers";
export const MAX_UPLOAD_MB = 5;
/** Ukuran maksimum sisi gambar setelah dikompresi. */
export const COVER_MAX_WIDTH = 900;
export const COVER_THUMB_WIDTH = 260;

export const LOAN_STATUS_LABEL = {
  dipinjam: "Sedang dipinjam",
  dikembalikan: "Sudah dikembalikan",
} as const;

export const DEFAULT_CATEGORIES = [
  "Fiksi",
  "Nonfiksi",
  "Teknologi",
  "Bisnis",
  "Sejarah",
  "Agama",
  "Pendidikan",
  "Biografi",
  "Komik",
  "Novel",
  "Lainnya",
];

export const DEFAULT_LOCATIONS = [
  { name: "Rak A", description: "Rak kayu ruang kerja" },
  { name: "Rak B", description: "Rak ruang tamu" },
  { name: "Lemari kamar", description: "Lemari pakaian, rak bawah" },
  { name: "Ruang tamu", description: "Meja sudut ruang tamu" },
  { name: "Kardus 1", description: "Kardus di gudang" },
  { name: "Kardus 2", description: "Kardus di gudang" },
];
