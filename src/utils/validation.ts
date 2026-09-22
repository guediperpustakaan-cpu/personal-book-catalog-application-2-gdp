import { bersihkanIsbn } from "@/lib/format";
import type { BookInput } from "@/types";

export interface KesalahanForm {
  [field: string]: string;
}

export interface NilaiFormBuku extends BookInput {
  /** Berkas sampul baru yang dipilih pengguna (belum diunggah). */
  berkasSampul?: File | null;
}

function wajib(nilai: unknown): boolean {
  if (typeof nilai === "string") return nilai.trim().length > 0;
  return nilai !== null && nilai !== undefined;
}

/**
 * Validasi formulir buku. Semua pesan ditulis dalam bahasa Indonesia.
 * Mengembalikan objek kosong bila seluruh input valid.
 */
export function validasiBuku(nilai: NilaiFormBuku): KesalahanForm {
  const error: KesalahanForm = {};

  if (!wajib(nilai.title)) {
    error.title = "Judul buku wajib diisi.";
  } else if (nilai.title.trim().length > 300) {
    error.title = "Judul maksimal 300 karakter.";
  }

  if (nilai.author && nilai.author.length > 200) {
    error.author = "Nama penulis maksimal 200 karakter.";
  }

  if (nilai.isbn) {
    const isbn = bersihkanIsbn(nilai.isbn);
    if (isbn.length !== 10 && isbn.length !== 13) {
      error.isbn = "ISBN harus 10 atau 13 digit angka.";
    }
  }

  if (
    nilai.publicationYear !== null &&
    nilai.publicationYear !== undefined &&
    (nilai.publicationYear as unknown as string) !== ""
  ) {
    const tahun = Number(nilai.publicationYear);
    const kini = new Date().getFullYear();
    if (!Number.isInteger(tahun) || tahun < 1000 || tahun > kini + 2) {
      error.publicationYear = `Tahun terbit harus antara 1000 dan ${kini + 2}.`;
    }
  }

  if (
    nilai.pageCount !== null &&
    nilai.pageCount !== undefined &&
    (nilai.pageCount as unknown as string) !== ""
  ) {
    const halaman = Number(nilai.pageCount);
    if (!Number.isInteger(halaman) || halaman < 1 || halaman > 20000) {
      error.pageCount = "Jumlah halaman harus berupa angka 1 sampai 20.000.";
    }
  }

  if (nilai.rating !== null && nilai.rating !== undefined) {
    const rating = Number(nilai.rating);
    if (rating < 0 || rating > 5) {
      error.rating = "Rating harus antara 0 sampai 5.";
    }
  }

  if (nilai.description && nilai.description.length > 5000) {
    error.description = "Deskripsi maksimal 5.000 karakter.";
  }

  if (nilai.notes && nilai.notes.length > 2000) {
    error.notes = "Catatan maksimal 2.000 karakter.";
  }

  return error;
}

export interface KesalahanPeminjaman {
  [field: string]: string;
}

export function validasiPeminjaman(nilai: {
  bookId: string;
  borrowerName: string;
  borrowedAt: string;
  dueAt: string;
}): KesalahanPeminjaman {
  const error: KesalahanPeminjaman = {};
  if (!nilai.bookId) error.bookId = "Pilih buku yang dipinjamkan.";
  if (!wajib(nilai.borrowerName))
    error.borrowerName = "Nama peminjam wajib diisi.";
  if (!nilai.borrowedAt) error.borrowedAt = "Tanggal dipinjam wajib diisi.";
  if (!nilai.dueAt) error.dueAt = "Batas waktu pengembalian wajib diisi.";
  if (nilai.borrowedAt && nilai.dueAt && nilai.dueAt < nilai.borrowedAt) {
    error.dueAt =
      "Batas pengembalian tidak boleh lebih awal dari tanggal dipinjam.";
  }
  return error;
}
