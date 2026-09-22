import { buatDataAwal } from "@/data/seed";
import { bersihkanIsbn } from "@/lib/format";
import type { DataService } from "@/services/types";
import type {
  Book,
  BookInput,
  BookListParams,
  Category,
  Loan,
  LoanWithBook,
  Paginated,
  ReadingLog,
  StorageLocation,
} from "@/types";
import { buatId } from "@/utils/id";

const KUNCI = "bukurumah.data.v1";

interface BasisDataLokal {
  books: Book[];
  categories: Category[];
  locations: StorageLocation[];
  loans: Loan[];
  readingLogs: ReadingLog[];
}

let cache: BasisDataLokal | null = null;

function simpan(db: BasisDataLokal) {
  cache = db;
  try {
    localStorage.setItem(KUNCI, JSON.stringify(db));
  } catch {
    // Kuota penuh: data tetap dipakai di memori agar aplikasi tidak gagal.
    console.warn("Penyimpanan lokal penuh, perubahan hanya tersimpan sementara.");
  }
}

function muat(): BasisDataLokal {
  if (cache) return cache;
  try {
    const isi = localStorage.getItem(KUNCI);
    if (isi) {
      const parsed = JSON.parse(isi) as BasisDataLokal;
      if (parsed && Array.isArray(parsed.books)) {
        cache = parsed;
        return parsed;
      }
    }
  } catch {
    // lanjut ke data awal
  }
  const awal = buatDataAwal();
  simpan(awal);
  return awal;
}

function banding(a: string | number | null, b: string | number | null, arah: number) {
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return (a - b) * arah;
  return String(a).localeCompare(String(b), "id", { sensitivity: "base" }) * arah;
}

/** Implementasi penyimpanan lokal tanpa Supabase. */
export const localBackend: DataService = {
  mode: "lokal",

  async listBooks(params: BookListParams): Promise<Paginated<Book>> {
    const db = muat();
    const q = (params.search ?? "").trim().toLowerCase();
    const arah = params.direction === "asc" ? 1 : -1;
    const kolom = params.sort ?? "created_at";

    let hasil = db.books.filter((b) => {
      if (params.categoryId && b.categoryId !== params.categoryId) return false;
      if (params.locationId && b.storageLocationId !== params.locationId) return false;
      if (params.condition && b.condition !== params.condition) return false;
      if (params.readingStatus && b.readingStatus !== params.readingStatus) return false;
      if (params.ownershipStatus && b.ownershipStatus !== params.ownershipStatus) return false;
      if (params.onlyLoaned && b.ownershipStatus !== "dipinjamkan") return false;
      if (!q) return true;
      return [b.title, b.author, b.isbn, b.notes, b.publisher]
        .filter(Boolean)
        .some((nilai) => String(nilai).toLowerCase().includes(q));
    });

    hasil = [...hasil].sort((a, b) => {
      if (kolom === "title") return banding(a.title, b.title, arah);
      if (kolom === "author") return banding(a.author, b.author, arah);
      if (kolom === "publication_year")
        return banding(a.publicationYear, b.publicationYear, arah);
      if (kolom === "rating") return banding(a.rating, b.rating, arah);
      return banding(a.createdAt, b.createdAt, arah);
    });

    const ukuran = params.pageSize ?? 12;
    const halaman = Math.max(1, params.page ?? 1);
    const total = hasil.length;
    const mulai = (halaman - 1) * ukuran;

    return {
      data: hasil.slice(mulai, mulai + ukuran),
      total,
      page: halaman,
      pageSize: ukuran,
      totalPages: Math.max(1, Math.ceil(total / ukuran)),
    };
  },

  async getBook(id: string) {
    return muat().books.find((b) => b.id === id) ?? null;
  },

  async createBook(input: BookInput, userId: string | null) {
    const db = muat();
    const now = new Date().toISOString();
    const buku: Book = {
      ...input,
      id: buatId(),
      userId,
      createdAt: now,
      updatedAt: now,
    };
    db.books.unshift(buku);
    simpan(db);
    return buku;
  },

  async createBooks(inputs: BookInput[], userId: string | null) {
    const db = muat();
    const now = new Date().toISOString();
    const isbnAda = new Set(
      db.books.map((b) => bersihkanIsbn(b.isbn)).filter(Boolean) as string[]
    );
    const baru: Book[] = [];
    inputs.forEach((input) => {
      const isbn = bersihkanIsbn(input.isbn);
      if (isbn && isbnAda.has(isbn)) return; // hindari duplikasi ISBN
      const buku: Book = { ...input, id: buatId(), userId, createdAt: now, updatedAt: now };
      isbnAda.add(isbn ?? buatId());
      baru.push(buku);
    });
    db.books = [...baru, ...db.books];
    simpan(db);
    return baru;
  },

  async updateBook(id: string, input: Partial<BookInput>) {
    const db = muat();
    const idx = db.books.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Buku tidak ditemukan.");
    const buku: Book = {
      ...db.books[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    db.books[idx] = buku;
    simpan(db);
    return buku;
  },

  async deleteBook(id: string) {
    const db = muat();
    db.books = db.books.filter((b) => b.id !== id);
    db.loans = db.loans.filter((l) => l.bookId !== id);
    db.readingLogs = db.readingLogs.filter((r) => r.bookId !== id);
    simpan(db);
  },

  async listCategories() {
    return [...muat().categories].sort((a, b) => a.name.localeCompare(b.name, "id"));
  },

  async createCategory(input, userId) {
    const db = muat();
    const now = new Date().toISOString();
    const ada = db.categories.find(
      (c) => c.name.trim().toLowerCase() === input.name.trim().toLowerCase()
    );
    if (ada) throw new Error("Kategori dengan nama tersebut sudah ada.");
    const kategori: Category = {
      id: buatId(),
      userId,
      name: input.name.trim(),
      createdAt: now,
      updatedAt: now,
    };
    db.categories.push(kategori);
    simpan(db);
    return kategori;
  },

  async updateCategory(id, input) {
    const db = muat();
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Kategori tidak ditemukan.");
    db.categories[idx] = {
      ...db.categories[idx],
      name: input.name.trim(),
      updatedAt: new Date().toISOString(),
    };
    simpan(db);
    return db.categories[idx];
  },

  async deleteCategory(id) {
    const db = muat();
    db.categories = db.categories.filter((c) => c.id !== id);
    db.books = db.books.map((b) =>
      b.categoryId === id ? { ...b, categoryId: null } : b
    );
    simpan(db);
  },

  async listLocations() {
    return [...muat().locations].sort((a, b) => a.name.localeCompare(b.name, "id"));
  },

  async createLocation(input, userId) {
    const db = muat();
    const now = new Date().toISOString();
    const ada = db.locations.find(
      (l) => l.name.trim().toLowerCase() === input.name.trim().toLowerCase()
    );
    if (ada) throw new Error("Lokasi dengan nama tersebut sudah ada.");
    const lokasi: StorageLocation = {
      id: buatId(),
      userId,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      createdAt: now,
      updatedAt: now,
    };
    db.locations.push(lokasi);
    simpan(db);
    return lokasi;
  },

  async updateLocation(id, input) {
    const db = muat();
    const idx = db.locations.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Lokasi tidak ditemukan.");
    db.locations[idx] = {
      ...db.locations[idx],
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      updatedAt: new Date().toISOString(),
    };
    simpan(db);
    return db.locations[idx];
  },

  async deleteLocation(id) {
    const db = muat();
    db.locations = db.locations.filter((l) => l.id !== id);
    db.books = db.books.map((b) =>
      b.storageLocationId === id ? { ...b, storageLocationId: null } : b
    );
    simpan(db);
  },

  async listLoans(): Promise<LoanWithBook[]> {
    const db = muat();
    return db.loans
      .map((l) => ({
        ...l,
        book: db.books.find((b) => b.id === l.bookId) ?? null,
      }))
      .sort((a, b) => (a.borrowedAt < b.borrowedAt ? 1 : -1));
  },

  async createLoan(input, userId) {
    const db = muat();
    const now = new Date().toISOString();
    const pinjaman: Loan = {
      id: buatId(),
      userId,
      bookId: input.bookId,
      borrowerName: input.borrowerName.trim(),
      borrowerContact: input.borrowerContact?.trim() || null,
      borrowedAt: input.borrowedAt,
      dueAt: input.dueAt,
      returnedAt: input.returnedAt ?? null,
      status: input.status ?? "dipinjam",
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };
    db.loans.unshift(pinjaman);
    if (pinjaman.status === "dipinjam") {
      db.books = db.books.map((b) =>
        b.id === pinjaman.bookId ? { ...b, ownershipStatus: "dipinjamkan" } : b
      );
    }
    simpan(db);
    return pinjaman;
  },

  async updateLoan(id, input) {
    const db = muat();
    const idx = db.loans.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error("Data peminjaman tidak ditemukan.");
    const baru: Loan = { ...db.loans[idx], ...input, updatedAt: new Date().toISOString() };
    db.loans[idx] = baru;
    if (baru.status === "dikembalikan") {
      db.books = db.books.map((b) =>
        b.id === baru.bookId ? { ...b, ownershipStatus: "dimiliki" } : b
      );
    } else if (baru.status === "dipinjam") {
      db.books = db.books.map((b) =>
        b.id === baru.bookId ? { ...b, ownershipStatus: "dipinjamkan" } : b
      );
    }
    simpan(db);
    return baru;
  },

  async deleteLoan(id) {
    const db = muat();
    db.loans = db.loans.filter((l) => l.id !== id);
    simpan(db);
  },

  async addReadingLog(log, userId) {
    const db = muat();
    const baru: ReadingLog = { ...log, id: buatId(), userId, createdAt: new Date().toISOString() };
    db.readingLogs.push(baru);
    simpan(db);
    return baru;
  },

  async isUsed(kind, id) {
    const db = muat();
    return db.books.some((b) =>
      kind === "category" ? b.categoryId === id : b.storageLocationId === id
    );
  },

  async resetLokal() {
    const awal = buatDataAwal();
    simpan(awal);
  },
};
