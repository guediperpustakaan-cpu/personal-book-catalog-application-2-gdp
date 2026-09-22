import { COVER_BUCKET } from "@/lib/constants";
import { bersihkanIsbn } from "@/lib/format";
import { getSupabase } from "@/integrations/supabase/client";
import { KOLOM_SORT, type DataService } from "@/services/types";
import type {
  Book,
  BookInput,
  BookListParams,
  Category,
  Loan,
  LoanInput,
  LoanWithBook,
  Paginated,
  ReadingLog,
  StorageLocation,
} from "@/types";

type Baris = Record<string, unknown>;

function wajibSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase belum dikonfigurasi.");
  return supabase;
}

function teks(nilai: unknown): string | null {
  if (nilai === null || nilai === undefined) return null;
  const s = String(nilai).trim();
  return s === "" ? null : s;
}

function angka(nilai: unknown): number | null {
  if (nilai === null || nilai === undefined || nilai === "") return null;
  const n = Number(nilai);
  return Number.isFinite(n) ? n : null;
}

/* ------------------------------- pemetaan ------------------------------- */

function mapCategory(r: Baris): Category {
  return {
    id: String(r.id),
    userId: teks(r.user_id),
    name: String(r.name ?? ""),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapLocation(r: Baris): StorageLocation {
  return {
    id: String(r.id),
    userId: teks(r.user_id),
    name: String(r.name ?? ""),
    description: teks(r.description),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapBook(r: Baris): Book {
  return {
    id: String(r.id),
    userId: teks(r.user_id),
    title: String(r.title ?? ""),
    author: teks(r.author),
    isbn: teks(r.isbn),
    publisher: teks(r.publisher),
    publicationYear: angka(r.publication_year),
    edition: teks(r.edition),
    language: teks(r.language),
    categoryId: teks(r.category_id),
    description: teks(r.description),
    pageCount: angka(r.page_count),
    coverImageUrl: teks(r.cover_image_url),
    coverThumbUrl: teks(r.cover_thumb_url),
    condition: teks(r.condition) as Book["condition"],
    storageLocationId: teks(r.storage_location_id),
    readingStatus: teks(r.reading_status) as Book["readingStatus"],
    ownershipStatus: teks(r.ownership_status) as Book["ownershipStatus"],
    rating: angka(r.rating),
    notes: teks(r.notes),
    acquiredDate: teks(r.acquired_date),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function mapLoan(r: Baris): Loan {
  return {
    id: String(r.id),
    userId: teks(r.user_id),
    bookId: String(r.book_id),
    borrowerName: String(r.borrower_name ?? ""),
    borrowerContact: teks(r.borrower_contact),
    borrowedAt: String(r.borrowed_at ?? ""),
    dueAt: String(r.due_at ?? ""),
    returnedAt: teks(r.returned_at),
    status: teks(r.status) as Loan["status"],
    notes: teks(r.notes),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

function bukuKeBaris(input: BookInput | Partial<BookInput>) {
  const baris: Baris = {};
  if ("title" in input) baris.title = input.title?.trim();
  if ("author" in input) baris.author = teks(input.author);
  if ("isbn" in input) baris.isbn = bersihkanIsbn(input.isbn) || null;
  if ("publisher" in input) baris.publisher = teks(input.publisher);
  if ("publicationYear" in input) baris.publication_year = input.publicationYear ?? null;
  if ("edition" in input) baris.edition = teks(input.edition);
  if ("language" in input) baris.language = teks(input.language);
  if ("categoryId" in input) baris.category_id = input.categoryId ?? null;
  if ("description" in input) baris.description = teks(input.description);
  if ("pageCount" in input) baris.page_count = input.pageCount ?? null;
  if ("coverImageUrl" in input) baris.cover_image_url = input.coverImageUrl ?? null;
  if ("coverThumbUrl" in input) baris.cover_thumb_url = input.coverThumbUrl ?? null;
  if ("condition" in input) baris.condition = input.condition ?? null;
  if ("storageLocationId" in input) baris.storage_location_id = input.storageLocationId ?? null;
  if ("readingStatus" in input) baris.reading_status = input.readingStatus ?? null;
  if ("ownershipStatus" in input) baris.ownership_status = input.ownershipStatus ?? null;
  if ("rating" in input) baris.rating = input.rating ?? null;
  if ("notes" in input) baris.notes = teks(input.notes);
  if ("acquiredDate" in input) baris.acquired_date = input.acquiredDate ?? null;
  return baris;
}

function pinjamanKeBaris(input: LoanInput | Partial<LoanInput>) {
  const baris: Baris = {};
  if ("bookId" in input) baris.book_id = input.bookId;
  if ("borrowerName" in input) baris.borrower_name = input.borrowerName?.trim();
  if ("borrowerContact" in input) baris.borrower_contact = teks(input.borrowerContact);
  if ("borrowedAt" in input) baris.borrowed_at = input.borrowedAt;
  if ("dueAt" in input) baris.due_at = input.dueAt;
  if ("returnedAt" in input) baris.returned_at = input.returnedAt ?? null;
  if ("status" in input && input.status) baris.status = input.status;
  if ("notes" in input) baris.notes = teks(input.notes);
  return baris;
}

function pesanError(err: unknown, cadangan: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = String((err as { message: unknown }).message);
    if (m) return m;
  }
  return cadangan;
}

/* ------------------------------ implementasi ----------------------------- */

export const supabaseBackend: DataService = {
  mode: "supabase",

  async listBooks(params: BookListParams): Promise<Paginated<Book>> {
    const supabase = wajibSupabase();
    const ukuran = params.pageSize ?? 12;
    const halaman = Math.max(1, params.page ?? 1);
    const kolom = KOLOM_SORT[params.sort ?? "created_at"];
    const arah = params.direction === "asc" ? false : true;

    let kueri = supabase
      .from("books")
      .select("*", { count: "exact" })
      .order(kolom, { ascending: arah })
      .order("title", { ascending: true })
      .range((halaman - 1) * ukuran, halaman * ukuran - 1);

    const q = params.search?.trim();
    if (q) {
      // Pencarian judul, penulis, ISBN, penerbit, dan catatan.
      const aman = q.replace(/[%_,()]/g, " ").trim();
      kueri = kueri.or(
        [
          `title.ilike.%${aman}%`,
          `author.ilike.%${aman}%`,
          `isbn.ilike.%${aman}%`,
          `publisher.ilike.%${aman}%`,
          `notes.ilike.%${aman}%`,
        ].join(",")
      );
    }
    if (params.categoryId) kueri = kueri.eq("category_id", params.categoryId);
    if (params.locationId) kueri = kueri.eq("storage_location_id", params.locationId);
    if (params.condition) kueri = kueri.eq("condition", params.condition);
    if (params.readingStatus) kueri = kueri.eq("reading_status", params.readingStatus);
    if (params.ownershipStatus)
      kueri = kueri.eq("ownership_status", params.ownershipStatus);
    if (params.onlyLoaned) kueri = kueri.eq("ownership_status", "dipinjamkan");

    const { data, error, count } = await kueri;
    if (error) throw new Error(pesanError(error, "Gagal memuat daftar buku."));

    const total = count ?? 0;
    return {
      data: (data ?? []).map(mapBook),
      total,
      page: halaman,
      pageSize: ukuran,
      totalPages: Math.max(1, Math.ceil(total / ukuran)),
    };
  },

  async getBook(id: string) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(pesanError(error, "Gagal memuat detail buku."));
    return data ? mapBook(data) : null;
  },

  async createBook(input: BookInput, userId: string | null) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("books")
      .insert({ ...bukuKeBaris(input), user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal menyimpan buku."));
    return mapBook(data);
  },

  async createBooks(inputs: BookInput[], userId: string | null) {
    const hasil: Book[] = [];
    for (const input of inputs) {
      try {
        hasil.push(await this.createBook(input, userId));
      } catch {
        // Baris bermasalah dilewati agar proses impor lain tetap berhasil.
      }
    }
    return hasil;
  },

  async updateBook(id: string, input: Partial<BookInput>) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("books")
      .update(bukuKeBaris(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal memperbarui buku."));
    return mapBook(data);
  },

  async deleteBook(id: string) {
    const supabase = wajibSupabase();
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) throw new Error(pesanError(error, "Gagal menghapus buku."));
  },

  async listCategories() {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(pesanError(error, "Gagal memuat kategori."));
    return (data ?? []).map(mapCategory);
  },

  async createCategory(input, userId) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: input.name.trim(), user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal menambah kategori."));
    return mapCategory(data);
  },

  async updateCategory(id, input) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("categories")
      .update({ name: input.name.trim() })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal mengubah kategori."));
    return mapCategory(data);
  },

  async deleteCategory(id) {
    const supabase = wajibSupabase();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(pesanError(error, "Gagal menghapus kategori."));
  },

  async listLocations() {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("storage_locations")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw new Error(pesanError(error, "Gagal memuat lokasi."));
    return (data ?? []).map(mapLocation);
  },

  async createLocation(input, userId) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("storage_locations")
      .insert({
        name: input.name.trim(),
        description: input.description?.trim() ?? null,
        user_id: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal menambah lokasi."));
    return mapLocation(data);
  },

  async updateLocation(id, input) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("storage_locations")
      .update({
        name: input.name.trim(),
        description: input.description?.trim() ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal mengubah lokasi."));
    return mapLocation(data);
  },

  async deleteLocation(id) {
    const supabase = wajibSupabase();
    const { error } = await supabase.from("storage_locations").delete().eq("id", id);
    if (error) throw new Error(pesanError(error, "Gagal menghapus lokasi."));
  },

  async listLoans(): Promise<LoanWithBook[]> {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("loans")
      .select("*, book:books(id, title, author, isbn, cover_image_url, cover_thumb_url)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(pesanError(error, "Gagal memuat data peminjaman."));
    return (data ?? []).map((r) => {
      const pinjaman = mapLoan(r as Baris);
      const buku = (r as Baris).book as Baris | null;
      return {
        ...pinjaman,
        book: buku
          ? {
              id: String(buku.id),
              title: String(buku.title ?? ""),
              author: teks(buku.author),
              isbn: teks(buku.isbn),
              coverImageUrl: teks(buku.cover_image_url),
              coverThumbUrl: teks(buku.cover_thumb_url),
            }
          : null,
      };
    });
  },

  async createLoan(input: LoanInput, userId: string | null) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("loans")
      .insert({ ...pinjamanKeBaris(input), user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal menyimpan peminjaman."));
    return mapLoan(data);
  },

  async updateLoan(id, input) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("loans")
      .update(pinjamanKeBaris(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal memperbarui peminjaman."));
    return mapLoan(data);
  },

  async deleteLoan(id) {
    const supabase = wajibSupabase();
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) throw new Error(pesanError(error, "Gagal menghapus peminjaman."));
  },

  async addReadingLog(log, userId) {
    const supabase = wajibSupabase();
    const { data, error } = await supabase
      .from("reading_logs")
      .insert({
        user_id: userId,
        book_id: log.bookId,
        status: log.status,
        started_at: log.startedAt,
        finished_at: log.finishedAt,
        notes: log.notes,
      })
      .select("*")
      .single();
    if (error) throw new Error(pesanError(error, "Gagal mencatat riwayat baca."));
    return {
      id: String(data.id),
      userId: teks(data.user_id),
      bookId: String(data.book_id),
      status: data.status as ReadingLog["status"],
      startedAt: teks(data.started_at),
      finishedAt: teks(data.finished_at),
      notes: teks(data.notes),
      createdAt: String(data.created_at),
    };
  },

  async isUsed(kind, id) {
    const supabase = wajibSupabase();
    const kolom = kind === "category" ? "category_id" : "storage_location_id";
    const { count } = await supabase
      .from("books")
      .select("id", { count: "exact", head: true })
      .eq(kolom, id);
    return (count ?? 0) > 0;
  },
};

/**
 * Unggah sampul buku ke Supabase Storage (bucket "covers").
 * Di return juga url thumbnail agar daftar buku tetap ringan.
 */
export async function unggahSampulKeStorage(
  file: File,
  thumbFile: File,
  userId: string
): Promise<{ coverImageUrl: string; coverThumbUrl: string }> {
  const supabase = wajibSupabase();
  const ekstensi = file.name.endsWith(".png") ? "png" : "jpg";
  const dasar = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const utama = await supabase.storage
    .from(COVER_BUCKET)
    .upload(`${dasar}.${ekstensi}`, file, { upsert: true, contentType: file.type });
  if (utama.error) throw new Error(pesanError(utama.error, "Gagal mengunggah sampul."));

  const thumb = await supabase.storage
    .from(COVER_BUCKET)
    .upload(`${dasar}-thumb.jpg`, thumbFile, {
      upsert: true,
      contentType: thumbFile.type,
    });

  const urlUtama = supabase.storage.from(COVER_BUCKET).getPublicUrl(`${dasar}.${ekstensi}`).data.publicUrl;
  const urlThumb = thumb.error
    ? urlUtama
    : supabase.storage.from(COVER_BUCKET).getPublicUrl(`${dasar}-thumb.jpg`).data.publicUrl;

  return { coverImageUrl: urlUtama, coverThumbUrl: urlThumb };
}
