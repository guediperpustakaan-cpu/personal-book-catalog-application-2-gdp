import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useImporBuku, useKategori, useLokasi } from "@/hooks/useLibrary";
import { useKoleksiPenuh } from "@/hooks/useStats";
import { bersihkanIsbn } from "@/lib/format";
import {
  bukuKeBarisCsv,
  csvKeBuku,
  keCsv,
  templateCsv,
  unduhTeks,
  HEADER_CSV,
  type HasilImpor,
} from "@/utils/csv";
import { pesanError } from "@/utils/error";
import type { BookInput } from "@/types";

/** Impor data buku dari berkas CSV dengan pratinjau sebelum disimpan. */
export function CsvImport() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasil, setHasil] = useState<HasilImpor | null>(null);
  const [namaBerkas, setNamaBerkas] = useState("");
  const impor = useImporBuku();
  const { data: kategori = [] } = useKategori();
  const { data: lokasi = [] } = useLokasi();
  const { data: bukuAda = [] } = useKoleksiPenuh();

  const isbnTersedia = useMemo(
    () =>
      new Set(
        bukuAda
          .map((b) => bersihkanIsbn(b.isbn))
          .filter((i) => i.length > 0) as string[]
      ),
    [bukuAda]
  );

  const prosesBerkas = async (file?: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.peringatan("Berkas terlalu besar", "Ukuran berkas CSV maksimal 5 MB.");
      return;
    }
    try {
      const isi = await file.text();
      const hasilParse = csvKeBuku(isi, kategori, lokasi);
      setHasil(hasilParse);
      setNamaBerkas(file.name);
      if (hasilParse.valid.length === 0) {
        toast.peringatan("Tidak ada data yang bisa diimpor", "Periksa format kolom pada berkas CSV.");
      } else {
        toast.info(
          "Berkas terbaca",
          `${hasilParse.valid.length} baris siap diimpor, ${hasilParse.error.length} baris bermasalah.`
        );
      }
    } catch (err) {
      toast.gagal("Gagal membaca berkas", pesanError(err));
    }
  };

  const barisBaru = useMemo(() => {
    if (!hasil) return [];
    const terlihat: BookInput[] = [];
    const isbnBaru = new Set<string>();
    hasil.valid.forEach((b) => {
      const isbn = bersihkanIsbn(b.isbn);
      const duplikat = isbn ? isbnTersedia.has(isbn) || isbnBaru.has(isbn) : false;
      if (duplikat) return;
      if (isbn) isbnBaru.add(isbn);
      terlihat.push({
        title: b.judul,
        author: b.penulis,
        isbn: b.isbn,
        publisher: b.penerbit,
        publicationYear: b.publicationYear,
        edition: b.edition,
        language: b.language,
        categoryId: b.categoryId,
        description: b.description,
        pageCount: b.pageCount,
        coverImageUrl: null,
        coverThumbUrl: null,
        condition: b.condition,
        storageLocationId: b.storageLocationId,
        readingStatus: b.readingStatus,
        ownershipStatus: b.ownershipStatus,
        rating: b.rating,
        notes: b.notes,
        acquiredDate: b.acquiredDate,
      });
    });
    return terlihat;
  }, [hasil, isbnTersedia]);

  const jumlahDuplikat = hasil ? hasil.valid.length - barisBaru.length : 0;

  const simpanImpor = async () => {
    if (barisBaru.length === 0) return;
    try {
      const tersimpan = await impor.mutateAsync(barisBaru);
      toast.sukses(
        "Impor selesai",
        `${tersimpan.length} buku berhasil disimpan${
          barisBaru.length - tersimpan.length > 0
            ? `, ${barisBaru.length - tersimpan.length} baris gagal`
            : ""
        }.`
      );
      setHasil(null);
      setNamaBerkas("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      toast.gagal("Impor gagal", pesanError(err));
    }
  };

  return (
    <Card>
      <CardHeader
        judul="Impor data buku dari CSV"
        deskripsi="Pilih berkas CSV, periksa pratinjau, lalu simpan."
        aksi={
          <Button
            ukuran="kecil"
            variasi="garis"
            ikon={<FileSpreadsheet className="h-4 w-4" />}
            onClick={() => unduhTeks("contoh-format-buku.csv", templateCsv())}
          >
            Unduh template
          </Button>
        }
      />
      <CardBody className="space-y-4">
        <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 text-center dark:border-stone-700">
          <input
            ref={inputRef}
            id="unggah-csv"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => void prosesBerkas(e.target.files?.[0])}
          />
          <p className="text-sm text-stone-600 dark:text-stone-300">
            Kolom wajib hanya <strong>judul</strong>. Nama kategori dan lokasi harus sama persis
            dengan yang sudah tersimpan agar otomatis terhubung.
          </p>
          <Button
            className="mt-3"
            variasi="sekunder"
            ikon={<Upload className="h-4 w-4" />}
            onClick={() => inputRef.current?.click()}
          >
            Pilih berkas CSV
          </Button>
          {namaBerkas && (
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Berkas: {namaBerkas}</p>
          )}
        </div>

        {hasil && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBox label="Baris siap diimpor" nilai={String(barisBaru.length)} warna="emerald" />
              <InfoBox label="Baris bermasalah" nilai={String(hasil.error.length)} warna="rose" />
              <InfoBox label="Duplikat ISBN dilewati" nilai={String(jumlahDuplikat)} warna="amber" />
            </div>

            {barisBaru.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Pratinjau data buku yang akan diimpor</caption>
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-500 dark:border-stone-800 dark:bg-stone-950/50">
                      <th scope="col" className="px-3 py-2 font-medium">Judul</th>
                      <th scope="col" className="px-3 py-2 font-medium">Penulis</th>
                      <th scope="col" className="px-3 py-2 font-medium">ISBN</th>
                      <th scope="col" className="px-3 py-2 font-medium">Tahun</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barisBaru.slice(0, 8).map((b, i) => (
                      <tr key={i} className="border-b border-stone-100 last:border-0 dark:border-stone-800">
                        <td className="px-3 py-2">{b.title}</td>
                        <td className="px-3 py-2 text-stone-500">{b.author ?? "-"}</td>
                        <td className="px-3 py-2 text-stone-500">{b.isbn ?? "-"}</td>
                        <td className="px-3 py-2 text-stone-500">{b.publicationYear ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {barisBaru.length > 8 && (
                  <p className="px-3 py-2 text-xs text-stone-400">
                    dan {barisBaru.length - 8} buku lainnya…
                  </p>
                )}
              </div>
            ) : (
              <EmptyState
                judul="Tidak ada baris baru untuk diimpor"
                pesan="Semua baris mungkin sudah ada (duplikat ISBN) atau bermasalah."
              />
            )}

            {hasil.error.length > 0 && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                <p className="font-semibold">Baris yang tidak dapat diimpor:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  {hasil.error.slice(0, 6).map((e) => (
                    <li key={e.baris}>
                      Baris {e.baris}: {e.pesan}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void simpanImpor()} memuat={impor.isPending} disabled={barisBaru.length === 0}>
                Simpan {barisBaru.length} buku
              </Button>
              <Button
                variasi="garis"
                onClick={() => {
                  setHasil(null);
                  setNamaBerkas("");
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Batalkan
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function InfoBox({
  label,
  nilai,
  warna,
}: {
  label: string;
  nilai: string;
  warna: "emerald" | "rose" | "amber";
}) {
  const gaya = {
    emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    rose: "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  }[warna];
  return (
    <div className={`rounded-xl px-3 py-2.5 ${gaya}`}>
      <p className="text-lg font-semibold">{nilai}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

/** Tombol ekspor CSV (dipisah agar mudai dipakai ulang). */
export function tombolEksporCsv(
  buku: Parameters<typeof bukuKeBarisCsv>[0][],
  kategori: { id: string; name: string }[],
  lokasi: { id: string; name: string }[]
) {
  const namaKategori = (id: string | null) =>
    kategori.find((k) => k.id === id)?.name ?? "";
  const namaLokasi = (id: string | null) => lokasi.find((l) => l.id === id)?.name ?? "";
  const baris = buku.map((b) => bukuKeBarisCsv(b, namaKategori, namaLokasi));
  unduhTeks(
    `koleksi-buku-${new Date().toISOString().slice(0, 10)}.csv`,
    keCsv(baris, HEADER_CSV as unknown as string[])
  );
}
