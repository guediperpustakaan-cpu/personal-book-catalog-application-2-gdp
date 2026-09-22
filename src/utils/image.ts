import { COVER_MAX_WIDTH, COVER_THUMB_WIDTH, MAX_UPLOAD_MB } from "@/lib/constants";

export interface HasilKompresi {
  file: File;
  dataUrl: string;
  thumbDataUrl: string;
  lebar: number;
  tinggi: number;
  ukuranKb: number;
}

function bacaGambar(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Berkas harus berupa gambar (JPG, PNG, atau WebP)."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak dapat dibaca. Coba berkas lain."));
    };
    img.src = url;
  });
}

function gambarKeCanvas(img: HTMLImageElement, maxWidth: number) {
  const skala = Math.min(1, maxWidth / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * skala));
  canvas.height = Math.max(1, Math.round(img.height * skala));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Perangkat tidak mendukung pemrosesan gambar.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Kompresi + resize gambar sampul sebelum disimpan ke Supabase Storage.
 * Menghasilkan dua versi: gambar utama (detail) dan thumbnail (daftar).
 */
export async function kompresiGambar(
  file: File,
  opsi: { utama?: number; thumb?: number } = {}
): Promise<HasilKompresi> {
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(
      `Ukuran gambar maksimal ${MAX_UPLOAD_MB} MB. Silakan pilih gambar yang lebih kecil.`
    );
  }
  const img = await bacaGambar(file);
  const targetUtama = opsi.utama ?? COVER_MAX_WIDTH;
  const targetThumb = opsi.thumb ?? COVER_THUMB_WIDTH;

  const canvasUtama = gambarKeCanvas(img, targetUtama);
  const canvasThumb = gambarKeCanvas(img, targetThumb);

  const dataUrl = canvasUtama.toDataURL("image/jpeg", 0.82);
  const thumbDataUrl = canvasThumb.toDataURL("image/jpeg", 0.7);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvasUtama.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Gagal memproses gambar."))),
      "image/jpeg",
      0.85
    )
  );

  const nama = (file.name || "sampul.jpg").replace(/\.[^.]+$/, "");
  const fileBaru = new File([blob], `${nama}.jpg`, { type: "image/jpeg" });

  return {
    file: fileBaru,
    dataUrl,
    thumbDataUrl,
    lebar: canvasUtama.width,
    tinggi: canvasUtama.height,
    ukuranKb: Math.round(blob.size / 1024),
  };
}

/** Ubah data URL menjadi Blob (dipakai saat menyimpan gambar di mode lokal). */
export function dataUrlKeBlob(dataUrl: string): Blob {
  const [header, isi] = dataUrl.split(",");
  const tipe = /:(.*?);/.exec(header)?.[1] ?? "image/jpeg";
  const biner = atob(isi);
  const buffer = new Uint8Array(biner.length);
  for (let i = 0; i < biner.length; i += 1) buffer[i] = biner.charCodeAt(i);
  return new Blob([buffer], { type: tipe });
}
