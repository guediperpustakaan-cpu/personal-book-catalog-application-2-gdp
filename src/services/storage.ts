import { dataService, unggahSampulKeStorage } from "@/services/api";
import { kompresiGambar } from "@/utils/image";
import type { HasilKompresi } from "@/utils/image";

export interface HasilSampul {
  coverImageUrl: string;
  coverThumbUrl: string;
}

/**
 * Siapkan sampul buku: kompres + resize di perangkat, lalu simpan.
 * Mode Supabase -> Supabase Storage. Mode lokal -> data URL.
 */
export async function simpanSampul(file: File, userId: string | null): Promise<HasilSampul & { preview: HasilKompresi }> {
  const hasil = await kompresiGambar(file);

  if (dataService.mode === "supabase" && userId) {
    const thumbBlob = await (await fetch(hasil.thumbDataUrl)).blob();
    const thumbFile = new File([thumbBlob], "thumb.jpg", { type: "image/jpeg" });
    const url = await unggahSampulKeStorage(hasil.file, thumbFile, userId);
    return { ...url, preview: hasil };
  }

  return {
    coverImageUrl: hasil.dataUrl,
    coverThumbUrl: hasil.thumbDataUrl,
    preview: hasil,
  };
}
