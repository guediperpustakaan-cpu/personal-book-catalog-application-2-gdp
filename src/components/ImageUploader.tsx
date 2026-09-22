import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MAX_UPLOAD_MB } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { kompresiGambar } from "@/utils/image";
import { cn } from "@/utils/cn";

/**
 * Unggah foto sampul dengan drag & drop, pratinjau, dan kompresi otomatis
 * sebelum disimpan ke penyimpanan.
 */
export function ImageUploader({
  urlSaatIni,
  onSiap,
  onHapus,
  label = "Foto sampul buku",
}: {
  urlSaatIni: string | null;
  onSiap: (hasil: { file: File; dataUrl: string; thumbDataUrl: string }) => void;
  onHapus: () => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [menyeret, setMenyeret] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [pratinjau, setPratinjau] = useState<string | null>(urlSaatIni);
  const toast = useToast();

  const proses = async (file?: File | null) => {
    if (!file) return;
    setMemuat(true);
    try {
      const hasil = await kompresiGambar(file);
      setPratinjau(hasil.dataUrl);
      onSiap({ file: hasil.file, dataUrl: hasil.dataUrl, thumbDataUrl: hasil.thumbDataUrl });
      toast.info(
        "Sampul siap disimpan",
        `Ukuran setelah dikompresi sekitar ${hasil.ukuranKb} KB.`
      );
    } catch (err) {
      toast.gagal("Gagal memproses gambar", err instanceof Error ? err.message : undefined);
    } finally {
      setMemuat(false);
    }
  };

  const lepas = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setMenyeret(false);
    const file = e.dataTransfer.files?.[0];
    void proses(file);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setMenyeret(true);
        }}
        onDragLeave={() => setMenyeret(false)}
        onDrop={lepas}
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-4 text-center transition-colors",
          menyeret
            ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40"
            : "border-stone-300 bg-stone-50/60 dark:border-stone-700 dark:bg-stone-950/30"
        )}
      >
        {pratinjau ? (
          <img
            src={pratinjau}
            alt="Pratinjau sampul buku"
            className="max-h-56 w-auto rounded-xl object-contain shadow-sm"
          />
        ) : (
          <span
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-stone-400 shadow-sm dark:bg-stone-800"
            aria-hidden="true"
          >
            <ImagePlus className="h-7 w-7" />
          </span>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variasi="sekunder"
            ukuran="kecil"
            memuat={memuat}
            onClick={() => inputRef.current?.click()}
            ikon={<Upload className="h-4 w-4" />}
          >
            {pratinjau ? "Ganti foto" : "Pilih foto"}
          </Button>
          {pratinjau && (
            <Button
              variasi="hantu"
              ukuran="kecil"
              ikon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                setPratinjau(null);
                onHapus();
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              Hapus foto
            </Button>
          )}
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400">
          Tarik foto ke area ini atau pilih berkas. JPG/PNG maksimal {MAX_UPLOAD_MB} MB, akan
          otomatis diperkecil.
        </p>

        <input
          ref={inputRef}
          id="unggah-sampul"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void proses(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
