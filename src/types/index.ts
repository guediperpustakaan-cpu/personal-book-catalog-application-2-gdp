/**
 * Tipe data utama aplikasi BukuRumah.
 * Nama field memakai camelCase di frontend dan dipetakan ke snake_case
 * pada skema Supabase PostgreSQL (lihat services/supabaseBackend.ts).
 */

export type UUID = string;

export type ReadingStatus =
  | "belum_dibaca"
  | "sedang_dibaca"
  | "sudah_dibaca"
  | "tidak_ingin_dibaca";

export type OwnershipStatus =
  | "dimiliki"
  | "dipinjamkan"
  | "hilang"
  | "ingin_dijual"
  | "rusak";

export type BookCondition =
  | "baru"
  | "sangat_baik"
  | "baik"
  | "cukup"
  | "rusak";

export type LoanStatus = "dipinjam" | "dikembalikan";

export type BookSortField =
  | "title"
  | "author"
  | "publication_year"
  | "created_at"
  | "rating";

export type SortDirection = "asc" | "desc";

export interface Category {
  id: UUID;
  userId: UUID | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageLocation {
  id: UUID;
  userId: UUID | null;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: UUID;
  userId: UUID | null;
  title: string;
  author: string | null;
  isbn: string | null;
  publisher: string | null;
  publicationYear: number | null;
  edition: string | null;
  language: string | null;
  categoryId: UUID | null;
  description: string | null;
  pageCount: number | null;
  coverImageUrl: string | null;
  coverThumbUrl: string | null;
  condition: BookCondition | null;
  storageLocationId: UUID | null;
  readingStatus: ReadingStatus | null;
  ownershipStatus: OwnershipStatus | null;
  rating: number | null;
  notes: string | null;
  acquiredDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload yang dikirim dari formulir (belum memiliki id / timestamp). */
export type BookInput = Omit<
  Book,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export interface Loan {
  id: UUID;
  userId: UUID | null;
  bookId: UUID;
  borrowerName: string;
  borrowerContact: string | null;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: LoanStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LoanInput = Omit<
  Loan,
  "id" | "userId" | "createdAt" | "updatedAt" | "status" | "returnedAt"
> & {
  status?: LoanStatus;
  returnedAt?: string | null;
};

export interface ReadingLog {
  id: UUID;
  userId: UUID | null;
  bookId: UUID;
  status: ReadingStatus;
  startedAt: string | null;
  finishedAt: string | null;
  notes: string | null;
  createdAt: string;
}

/** Loan yang sudah digabung dengan data buku untuk kebutuhan tampilan. */
export interface LoanWithBook extends Loan {
  book?: Pick<
    Book,
    "id" | "title" | "author" | "coverImageUrl" | "coverThumbUrl" | "isbn"
  > | null;
}

export interface BookListParams {
  search?: string;
  categoryId?: string;
  locationId?: string;
  condition?: string;
  readingStatus?: string;
  ownershipStatus?: string;
  onlyLoaned?: boolean;
  sort?: BookSortField;
  direction?: SortDirection;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LibraryStats {
  total: number;
  read: number;
  unread: number;
  reading: number;
  loaned: number;
  categories: number;
  locations: number;
  averageRating: number;
}
