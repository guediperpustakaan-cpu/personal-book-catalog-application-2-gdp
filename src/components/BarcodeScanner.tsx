import { useCallback, useEffect, useRef, useState } from "react";
import { CameraOff, ScanLine, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { bersihkanIsbn } from "@/lib/format";
import { pesanError } from "@/utils/error";

type HasilDeteksi = { rawValue: string };

interface DeteksiBarcode {
  detect(sumber: CanvasImageSource): Promise<HasilDeteksi[]>;
}

const FORMAT_DUKUNG = ["ean_13", "ean_8", "upc_a", "upc_e", "isbn"];

function getDeteksi(): (new (o: { formats: string[] }) => DeteksiBarcode) | null {
  const kandidat = (
    window as unknown as {
      BarcodeDetector?: new (o: { formats: string[] }) => DeteksiBarcode;
    }
  ).BarcodeDetector;
  return kandidat ?? null;
}

/**
 * Pemindai ISBN melalui kamera memakai Barcode Detection API.
 * Bila perangkat tidak mendukung, pengguna tetap dapat mengetik ISBN manual.
 */
export function BarcodeScanner({
  onTerdeteksi,
  label = "Scan ISBN",
}: {
  onTerdeteksi: (isbn: string) => void;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const toast = useToast();
  const [aktif, setAktif] = useState(false);
  const [memulai, setMemulai] = useState(false);
  const [manual, setManual] = useState("");
  const [dukungan, setDukungan] = useState<boolean | null>(null);

  const hentikan = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAktif(false);
  }, []);

  useEffect(() => hentikan, [hentikan]);

  const mulai = async () => {
    const Deteksi = getDeteksi();
    setDukungan(Boolean(Deteksi));

    if (!navigator.mediaDevices?.getUserMedia) {
      toast.gagal(
        "Kamera tidak tersedia",
        "Perangkat atau peramban ini tidak mendukung akses kamera. Silakan masukkan ISBN secara manual."
      );
      return;
    }

    setMemulai(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setAktif(true);

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      if (!Deteksi) {
        toast.info(
          "Pemindaian otomatis belum tersedia",
          "Peramban ini belum mendukung pembacaan barcode. Silakan ketik ISBN di kolom manual."
        );
        return;
      }

      const deteksi = new Deteksi({ formats: FORMAT_DUKUNG });
      let sedangMemproses = false;

      const periksa = async () => {
        if (!sedangMemproses && video.readyState >= 2) {
          sedangMemproses = true;
          try {
            const hasil = await deteksi.detect(video);
            const kode = hasil[0]?.rawValue;
            const isbn = bersihkanIsbn(kode);
            if (isbn.length === 10 || isbn.length === 13) {
              hentikan();
              toast.sukses("ISBN terbaca", `Kode ${isbn} siap dipakai.`);
              onTerdeteksi(isbn);
              return;
            }
          } catch {
            // abaikan frame gagal, lanjut frame berikutnya
          } finally {
            sedangMemproses = false;
          }
        }
        frameRef.current = requestAnimationFrame(() => void periksa());
      };
      frameRef.current = requestAnimationFrame(() => void periksa());
    } catch (err) {
      setAktif(false);
      const pesan = pesanError(err);
      toast.gagal(
        "Tidak dapat membuka kamera",
        /denied|permission/i.test(pesan)
          ? "Izin kamera ditolak. Aktifkan izin kamera pada pengaturan peramban, atau masukkan ISBN secara manual."
          : "Kamera tidak dapat diakses. Silakan masukkan ISBN secara manual."
      );
    } finally {
      setMemulai(false);
    }
  };

  const kirimManual = () => {
    const isbn = bersihkanIsbn(manual);
    if (isbn.length !== 10 && isbn.length !== 13) {
      toast.peringatan("ISBN belum lengkap", "ISBN harus 10 atau 13 digit angka.");
      return;
    }
    onTerdeteksi(isbn);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Arahkan kamera ke barcode belakang buku (EAN-13/ISBN).
          </p>
        </div>
        {aktif ? (
          <Button variasi="garis" ikon={<CameraOff className="h-4 w-4" />} onClick={hentikan}>
            Hentikan kamera
          </Button>
        ) : (
          <Button ikon={<ScanLine className="h-4 w-4" />} onClick={() => void mulai()} memuat={memulai}>
            Mulai scan
          </Button>
        )}
      </div>

      {aktif && (
        <div className="relative overflow-hidden rounded-xl bg-stone-950">
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-video w-full object-cover"
            aria-label="Pratinjau kamera untuk memindai ISBN"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-24 w-2/3 rounded-xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          </div>
        </div>
      )}

      {dukungan === false && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
          Peramban ini belum mendukung pembacaan barcode otomatis. Silakan masukkan ISBN secara
          manual di bawah — fitur ini tetap berfungsi normal.
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field
          label="Masukkan ISBN secara manual"
          htmlFor="isbn-manual"
          petunjuk="Bisa 10 atau 13 digit, tanpa tanda hubung."
        >
          <Input
            id="isbn-manual"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            inputMode="numeric"
            placeholder="misal 9786024246945"
          />
        </Field>
        <Button variasi="garis" ikon={<Keyboard className="h-4 w-4" />} onClick={kirimManual}>
          Cari data buku
        </Button>
      </div>
    </div>
  );
}
