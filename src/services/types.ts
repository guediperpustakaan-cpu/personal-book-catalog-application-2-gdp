import type {
  Book,
  BookInput,
  BookListParams,
  BookSortField,
  Category,
  Loan,
  LoanInput,
  LoanWithBook,
  Paginated,
  ReadingLog,
  StorageLocation,
} from "@/types";

/**
 * Kontrak layanan data. Dua implementasi tersedia:
 *  - services/supabaseBackend.ts  (Supabase PostgreSQL + Storage + Auth)
 *  - services/localBackend.ts     (localStorage, untuk mode tanpa backend)
 * Menambahkan backend lain cukup membuat implementasi interface ini.
 */
export interface DataService {
  readonly mode: "supabase" | "lokal";

  // Buku
  listBooks(params: BookListParams): Promise<Paginated<Book>>;
  getBook(id: string): Promise<Book | null>;
  createBook(input: BookInput, userId: string | null): Promise<Book>;
  createBooks(inputs: BookInput[], userId: string | null): Promise<Book[]>;
  updateBook(id: string, input: Partial<BookInput>): Promise<Book>;
  deleteBook(id: string): Promise<void>;

  // Kategori
  listCategories(): Promise<Category[]>;
  createCategory(input: { name: string; description?: string }, userId: string | null): Promise<Category>;
  updateCategory(id: string, input: { name: string; description?: string }): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Lokasi
  listLocations(): Promise<StorageLocation[]>;
  createLocation(input: { name: string; description?: string }, userId: string | null): Promise<StorageLocation>;
  updateLocation(id: string, input: { name: string; description?: string }): Promise<StorageLocation>;
  deleteLocation(id: string): Promise<void>;

  // Peminjaman
  listLoans(): Promise<LoanWithBook[]>;
  createLoan(input: LoanInput, userId: string | null): Promise<Loan>;
  updateLoan(id: string, input: Partial<LoanInput>): Promise<Loan>;
  deleteLoan(id: string): Promise<void>;

  // Riwayat baca
  addReadingLog(log: Omit<ReadingLog, "id" | "createdAt">, userId: string | null): Promise<ReadingLog>;

  /** Kembalikan true jika kategori/lokasi masih dipakai buku. */
  isUsed(kind: "category" | "location", id: string): Promise<boolean>;

  /** Hapus seluruh data lokal (hanya untuk mode lokal). */
  resetLokal?(): Promise<void>;
}

export const KOLOM_SORT: Record<BookSortField, string> = {
  title: "title",
  author: "author",
  publication_year: "publication_year",
  created_at: "created_at",
  rating: "rating",
};
