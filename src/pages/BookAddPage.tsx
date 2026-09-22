import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookMarked, Info } from "lucide-react";
import { BookForm } from "@/components/BookForm";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { cariBukuDariIsbn, type InfoBukuDariIsbn } from "@/services/isbnLookup";
import { toDateInput } from "@/lib/format";
import type { NilaiFormBuku } from "@/utils/validation";

export default function BookAddPage() {
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [pratanpa, setPratanpa] = useState<Partial<NilaiFormBuku>>({});
  const [infoIsbn, setInfoIsbn] = useState<InfoBukuDariIsbn | null>(null);
  const [mencari, setMencari] = useState(false);
  const [scanTerbuka, setScanTerbuka] = useState(false);

  const isbn = params.get("isbn") ?? "";

  const cari = async (kode: string) => {
    setMencari(true);
    setInfoIsbn(null);
    try {
      const hasil = await cariBukuDariIsbn(kode);
      if (hasil) {
        setInfoIsbn(hasil);
        setPratanpa({
          isbn: kode,
          title: hasil.judul ?? "",
          author: hasil.penulis ?? "",
          publisher: hasil.penerbit ?? "",
          publicationYear: hasil.tahun ?? null,
          language: hasil.bahasa ?? "",
          description: hasil.deskripsi ?? "",
          pageCount: hasil.jumlahHalaman ?? null,
          coverImageUrl: hasil.sampulUrl ?? null,
          acquiredDate: toDateInput(new Date()),
        });
        toast.sukses(
          "Data buku ditemukan",
          "Periksa dan lengkapi informasi sebelum menyimpan."
        );
      } else {
        setPratanpa({ isbn: kode, acquiredDate: toDateInput(new Date()) });
        toast.info(
          "Data tidak ditemukan",
          "Silakan isi informasi buku secara manual."
        );
      }
    } catch {
      setPratanpa({ isbn: kode, acquiredDate: toDateInput(new Date()) });
      toast.peringatan(
        "Pencarian data gagal",
        "Periksa koneksi internet Anda atau isi formulir secara manual."
      );
    } finally {
      setMencari(false);
    }
  };

  useEffect(() => {
    if (isbn) void cari(isbn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      {infoIsbn && (
        <Card className="border-indigo-200 bg-indigo-50/60 dark:border-indigo-900 dark:bg-indigo-950/40">
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Info className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <div className="flex-1 text-sm text-indigo-900 dark:text-indigo-100">
              <p className="font-medium">Informasi buku ditemukan dari ISBN {isbn}</p>
              <p className="mt-0.5">
                {infoIsbn.judul ?? "-"}
                {infoIsbn.penulis ? ` — ${infoIsbn.penulis}` : ""}
                {infoIsbn.tahun ? ` (${infoIsbn.tahun})` : ""}. Anda dapat mengubah data apa pun
                sebelum menyimpan.
              </p>
            </div>
            <Button
              variasi="garis"
              ukuran="kecil"
              onClick={() => {
                setInfoIsbn(null);
                setParams({});
              }}
            >
              Abaikan
            </Button>
          </CardBody>
        </Card>
      )}

      {mencari && (
        <Card>
          <CardBody className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-indigo-600"
              aria-hidden="true"
            />
            Mencari informasi buku dari ISBN {isbn}…
          </CardBody>
        </Card>
      )}

      {!isbn && !mencari && (
        <Card>
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BookMarked className="mt-0.5 h-5 w-5 text-stone-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                  Punya buku di tangan?
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Pindai barcode ISBN untuk mengisi judul, penulis, dan penerbit secara otomatis.
                </p>
              </div>
            </div>
            <Button variasi="garis" onClick={() => setScanTerbuka(true)}>
              Scan ISBN
            </Button>
          </CardBody>
        </Card>
      )}

      <BookForm mode="tambah" pratanpa={pratanpa} />

      <Modal
        terbuka={scanTerbuka}
        tutup={() => setScanTerbuka(false)}
        judul="Pindai ISBN buku"
        deskripsi="Arahkan kamera ke barcode di belakang buku."
      >
        <BarcodeScanner
          onTerdeteksi={(kode) => {
            setScanTerbuka(false);
            setParams({ isbn: kode });
            void cari(kode);
          }}
        />
      </Modal>
    </div>
  );
}
