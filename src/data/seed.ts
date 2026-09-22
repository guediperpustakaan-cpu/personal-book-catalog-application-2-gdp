import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from "@/lib/constants";
import { buatId } from "@/utils/id";
import type {
  Book,
  BookCondition,
  Category,
  Loan,
  OwnershipStatus,
  ReadingLog,
  ReadingStatus,
  StorageLocation,
} from "@/types";

function hariLalu(hari: number): string {
  const d = new Date();
  d.setDate(d.getDate() - hari);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

function tanggal(hari: number): string {
  const d = new Date();
  d.setDate(d.getDate() + hari);
  return d.toISOString().slice(0, 10);
}

export interface DataAwal {
  categories: Category[];
  locations: StorageLocation[];
  books: Book[];
  loans: Loan[];
  readingLogs: ReadingLog[];
}

/**
 * Data contoh agar aplikasi langsung dapat diuji tanpa Supabase.
 * Berisi 12 buku dengan variasi kategori, lokasi, status, kondisi, dan rating.
 */
export function buatDataAwal(): DataAwal {
  const categories: Category[] = DEFAULT_CATEGORIES.map((name, i) => ({
    id: buatId(),
    userId: null,
    name,
    createdAt: hariLalu(120 - i),
    updatedAt: hariLalu(120 - i),
  }));

  const locations: StorageLocation[] = DEFAULT_LOCATIONS.map((l, i) => ({
    id: buatId(),
    userId: null,
    name: l.name,
    description: l.description,
    createdAt: hariLalu(120 - i),
    updatedAt: hariLalu(120 - i),
  }));

  const kat = (nama: string) => categories.find((c) => c.name === nama)?.id ?? null;
  const lok = (nama: string) => locations.find((l) => l.name === nama)?.id ?? null;

  const daftar: Array<
    Pick<
      Book,
      | "title"
      | "author"
      | "isbn"
      | "publisher"
      | "publicationYear"
      | "edition"
      | "language"
      | "description"
      | "pageCount"
      | "condition"
      | "rating"
      | "notes"
    > & {
      kategori: string;
      lokasi: string;
      baca: ReadingStatus;
      milik: OwnershipStatus;
      kondisi?: BookCondition;
      diperoleh?: string | null;
      umur: number;
    }
  > = [
    {
      title: "Bumi Manusia",
      author: "Pramoedya Ananta Toer",
      isbn: "9789799731234",
      publisher: "Hasta Mitra",
      publicationYear: 1980,
      edition: "Cetakan ke-40",
      language: "Indonesia",
      description:
        "Kisah Minke, pemuda pribumi terpelajar di akhir abad ke-19, dan pertemuannya dengan Nyai Ontosoroh.",
      pageCount: 535,
      condition: "baik",
      rating: 5,
      notes: "Sampul sedikit pudar, halaman masih lengkap.",
      kategori: "Novel",
      lokasi: "Rak A",
      baca: "sudah_dibaca",
      milik: "dimiliki",
      diperoleh: "2019-06-14",
      umur: 3,
    },
    {
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      publisher: "Prentice Hall",
      publicationYear: 2008,
      edition: "Edisi pertama",
      language: "Inggris",
      description:
        "Panduan menulis kode yang mudah dibaca, dirawat, dan dipahami oleh tim pengembang.",
      pageCount: 464,
      condition: "sangat_baik",
      rating: 4,
      notes: "Banyak catatan pribadi di margin.",
      kategori: "Teknologi",
      lokasi: "Rak A",
      baca: "sedang_dibaca",
      milik: "dimiliki",
      diperoleh: "2022-02-08",
      umur: 6,
    },
    {
      title: "Sapiens: Riwayat Singkat Umat Manusia",
      author: "Yuval Noah Harari",
      isbn: "9786024246945",
      publisher: "Kepustakaan Populer Gramedia",
      publicationYear: 2016,
      edition: "Cetakan ke-12",
      language: "Indonesia",
      description:
        "Perjalanan panjang Homo sapiens dari revolusi kognitif hingga era kapitalisme global.",
      pageCount: 528,
      condition: "baik",
      rating: 4.5,
      notes: null,
      kategori: "Sejarah",
      lokasi: "Ruang tamu",
      baca: "sudah_dibaca",
      milik: "dipinjamkan",
      diperoleh: "2021-11-02",
      umur: 12,
    },
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "9786020631873",
      publisher: "Gramedia Pustaka Utama",
      publicationYear: 2019,
      edition: "Cetakan ke-5",
      language: "Indonesia",
      description:
        "Cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk lewat perubahan kecil.",
      pageCount: 340,
      condition: "baru",
      rating: 4,
      notes: "Hadiah ulang tahun dari adik.",
      kategori: "Bisnis",
      lokasi: "Lemari kamar",
      baca: "sedang_dibaca",
      milik: "dimiliki",
      diperoleh: "2025-01-20",
      umur: 2,
    },
    {
      title: "Laskar Pelangi",
      author: "Andrea Hirata",
      isbn: "9789793062792",
      publisher: "Bentang Pustaka",
      publicationYear: 2005,
      edition: "Cetakan ke-25",
      language: "Indonesia",
      description:
        "Kisah sepuluh anak Belitung yang berjuang menempuh pendidikan di sekolah Muhammadiyah.",
      pageCount: 529,
      condition: "cukup",
      rating: 4.5,
      notes: "Beberapa halaman terlipat.",
      kategori: "Novel",
      lokasi: "Rak B",
      baca: "sudah_dibaca",
      milik: "dimiliki",
      diperoleh: "2018-08-17",
      umur: 40,
    },
    {
      title: "Sejarah Indonesia Modern",
      author: "M.C. Ricklefs",
      isbn: "9789794338651",
      publisher: "Serambi",
      publicationYear: 2008,
      edition: "Edisi ketiga",
      language: "Indonesia",
      description:
        "Rangkuman perjalanan politik Nusantara sejak 1300 hingga era reformasi.",
      pageCount: 712,
      condition: "sangat_baik",
      rating: 4,
      notes: null,
      kategori: "Sejarah",
      lokasi: "Rak B",
      baca: "belum_dibaca",
      milik: "dimiliki",
      diperoleh: "2023-04-09",
      umur: 25,
    },
    {
      title: "Tadabbur Al-Qur'an: Jilid 1",
      author: "M. Quraish Shihab",
      isbn: "9789793702612",
      publisher: "Lentera Hati",
      publicationYear: 2013,
      edition: "Cetakan ke-7",
      language: "Indonesia",
      description: "Tafsir tematis yang memudahkan pembaca memahami pesan Al-Qur'an.",
      pageCount: 386,
      condition: "baik",
      rating: 5,
      notes: "Dipakai untuk kajian rutin mingguan.",
      kategori: "Agama",
      lokasi: "Lemari kamar",
      baca: "sedang_dibaca",
      milik: "dimiliki",
      diperoleh: "2020-09-30",
      umur: 60,
    },
    {
      title: "The Pragmatic Programmer",
      author: "David Thomas, Andrew Hunt",
      isbn: "9780135957059",
      publisher: "Addison-Wesley",
      publicationYear: 2019,
      edition: "Edisi kedua",
      language: "Inggris",
      description: "Prinsip praktis pengembangan perangkat lunak yang relevan lintas bahasa.",
      pageCount: 352,
      condition: "baru",
      rating: 5,
      notes: null,
      kategori: "Teknologi",
      lokasi: "Rak A",
      baca: "belum_dibaca",
      milik: "dimiliki",
      diperoleh: "2025-06-01",
      umur: 5,
    },
    {
      title: "Detektif Conan Vol. 95",
      author: "Gosho Aoyama",
      isbn: "9784088812345",
      publisher: "Shogakukan",
      publicationYear: 2018,
      edition: null,
      language: "Jepang",
      description: "Kasus baru bagi Shinichi Kudo dan kawan-kawan.",
      pageCount: 192,
      condition: "sangat_baik",
      rating: 3.5,
      notes: "Dibeli saat kunjungan ke toko buku bekas.",
      kategori: "Komik",
      lokasi: "Kardus 1",
      baca: "sudah_dibaca",
      milik: "dimiliki",
      diperoleh: "2024-07-11",
      umur: 90,
    },
    {
      title: "Educated: Kisah Perjuangan Menempuh Pendidikan",
      author: "Tara Westover",
      isbn: "9786024248208",
      publisher: "Kepustakaan Populer Gramedia",
      publicationYear: 2019,
      edition: "Cetakan ke-3",
      language: "Indonesia",
      description: "Memoar perempuan yang tumbuh tanpa sekolah dan akhirnya meraih gelar doktor.",
      pageCount: 424,
      condition: "baik",
      rating: 4.5,
      notes: null,
      kategori: "Biografi",
      lokasi: "Ruang tamu",
      baca: "belum_dibaca",
      milik: "dimiliki",
      diperoleh: "2024-12-05",
      umur: 75,
    },
    {
      title: "Matematika Dasar untuk SMA Kelas X",
      author: "Tim Kemdikbud",
      isbn: "9786022827654",
      publisher: "Pusat Kurikulum dan Perbukuan",
      publicationYear: 2021,
      edition: "Edisi revisi",
      language: "Indonesia",
      description: "Buku pelajaran matematika wajib untuk kelas sepuluh.",
      pageCount: 296,
      condition: "rusak",
      rating: 3,
      notes: "Bekas dipakai kakak, sampul belakang lepas.",
      kategori: "Pendidikan",
      lokasi: "Kardus 2",
      baca: "tidak_ingin_dibaca",
      milik: "ingin_dijual",
      diperoleh: "2021-07-15",
      umur: 150,
    },
    {
      title: "Kisah Para Pemikir Indonesia",
      author: "Goenawan Mohamad",
      isbn: "9789794338729",
      publisher: "Kompas",
      publicationYear: 2010,
      edition: "Cetakan ke-2",
      language: "Indonesia",
      description: "Esai-esai tentang gagasan dan tokoh penting dalam sejarah kebudayaan Indonesia.",
      pageCount: 268,
      condition: "cukup",
      rating: 4,
      notes: "Ada noda kopi di halaman 40.",
      kategori: "Nonfiksi",
      lokasi: "Kardus 2",
      baca: "belum_dibaca",
      milik: "dimiliki",
      diperoleh: "2023-10-21",
      umur: 200,
    },
  ];

  const books: Book[] = daftar.map((b) => ({
    id: buatId(),
    userId: null,
    title: b.title,
    author: b.author,
    isbn: b.isbn,
    publisher: b.publisher,
    publicationYear: b.publicationYear,
    edition: b.edition,
    language: b.language,
    categoryId: kat(b.kategori),
    description: b.description,
    pageCount: b.pageCount,
    coverImageUrl: null,
    coverThumbUrl: null,
    condition: b.condition ?? "baik",
    storageLocationId: lok(b.lokasi),
    readingStatus: b.baca,
    ownershipStatus: b.milik,
    rating: b.rating,
    notes: b.notes,
    acquiredDate: b.diperoleh ?? null,
    createdAt: hariLalu(b.umur),
    updatedAt: hariLalu(Math.max(0, b.umur - 3)),
  }));

  const pinjamSapiens = books[2];
  const pinjamMatematika = books[10];

  const loans: Loan[] = [
    {
      id: buatId(),
      userId: null,
      bookId: pinjamSapiens.id,
      borrowerName: "Rani Kusuma",
      borrowerContact: "0812-3456-7890",
      borrowedAt: tanggal(-20),
      dueAt: tanggal(-6),
      returnedAt: null,
      status: "dipinjam",
      notes: "Untuk tugas kuliah anak sepupu.",
      createdAt: hariLalu(20),
      updatedAt: hariLalu(20),
    },
    {
      id: buatId(),
      userId: null,
      bookId: pinjamMatematika.id,
      borrowerName: "Pak Darto",
      borrowerContact: null,
      borrowedAt: tanggal(-4),
      dueAt: tanggal(10),
      returnedAt: null,
      status: "dipinjam",
      notes: "Tetangga sebelah, dipakai anaknya.",
      createdAt: hariLalu(4),
      updatedAt: hariLalu(4),
    },
    {
      id: buatId(),
      userId: null,
      bookId: books[4].id,
      borrowerName: "Dimas Prasetyo",
      borrowerContact: "0857-1122-3344",
      borrowedAt: tanggal(-70),
      dueAt: tanggal(-50),
      returnedAt: tanggal(-45),
      status: "dikembalikan",
      notes: "Sudah dikembalikan dalam kondisi lengkap.",
      createdAt: hariLalu(70),
      updatedAt: hariLalu(45),
    },
  ];

  const readingLogs: ReadingLog[] = books
    .filter((b) => b.readingStatus === "sudah_dibaca")
    .map((b) => ({
      id: buatId(),
      userId: null,
      bookId: b.id,
      status: "sudah_dibaca" as ReadingStatus,
      startedAt: null,
      finishedAt: b.updatedAt,
      notes: null,
      createdAt: b.updatedAt,
    }));

  return { categories, locations, books, loans, readingLogs };
}
