export interface InfoBukuDariIsbn {
  judul?: string | null;
  penulis?: string | null;
  penerbit?: string | null;
  tahun?: number | null;
  bahasa?: string | null;
  deskripsi?: string | null;
  jumlahHalaman?: number | null;
  sampulUrl?: string | null;
  kategori?: string | null;
}

function ambilBahasa(kode?: string): string | null {
  if (!kode) return null;
  const peta: Record<string, string> = {
    id: "Indonesia",
    en: "Inggris",
    ja: "Jepang",
    jv: "Jawa",
    su: "Sunda",
    ar: "Arab",
    zh: "Mandarin",
  };
  return peta[kode] ?? kode.toUpperCase();
}

async function dariGoogleBooks(isbn: string): Promise<InfoBukuDariIsbn | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.items?.[0]?.volumeInfo;
    if (!item) return null;
    return {
      judul: item.title ?? null,
      penulis: item.authors?.join(", ") ?? null,
      penerbit: item.publisher ?? null,
      tahun: item.publishedDate ? Number(String(item.publishedDate).slice(0, 4)) : null,
      bahasa: ambilBahasa(item.language),
      deskripsi: item.description ?? null,
      jumlahHalaman: item.pageCount ?? null,
      sampulUrl: item.imageLinks?.thumbnail?.replace("http://", "https://") ?? null,
    };
  } catch {
    return null;
  }
}

async function dariOpenLibrary(isbn: string): Promise<InfoBukuDariIsbn | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.[`ISBN:${isbn}`];
    if (!data) return null;
    return {
      judul: data.title ?? null,
      penulis: data.authors?.map((a: { name: string }) => a.name).join(", ") ?? null,
      penerbit: data.publishers?.[0]?.name ?? null,
      tahun: data.publish_date ? Number(String(data.publish_date).replace(/\D/g, "").slice(0, 4)) : null,
      jumlahHalaman: data.number_of_pages ?? null,
      sampulUrl: data.cover?.medium ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Cari informasi buku dari API publik berdasarkan ISBN.
 * Bila tidak ditemukan, aplikasi tetap menampilkan formulir manual.
 */
export async function cariBukuDariIsbn(isbn: string): Promise<InfoBukuDariIsbn | null> {
  const bersih = isbn.replace(/[^0-9Xx]/g, "");
  if (bersih.length !== 10 && bersih.length !== 13) return null;

  const hasil =
    (await dariGoogleBooks(bersih)) ?? (await dariOpenLibrary(bersih));
  return hasil;
}
