import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Sparkles, X } from "lucide-react";
import { CategorySelect } from "@/components/CategorySelect";
import { ImageUploader } from "@/components/ImageUploader";
import { LocationSelect } from "@/components/LocationSelect";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { RatingInput } from "@/components/ui/RatingInput";
import { useToast } from "@/components/ui/Toast";
import { useSimpanBuku, useUbahBuku } from "@/hooks/useLibrary";
import { useAuth } from "@/context/AuthContext";
import {
  BOOK_CONDITION,
  BOOK_CONDITION_LABEL,
  LANGUAGES,
  OWNERSHIP_STATUS,
  OWNERSHIP_STATUS_LABEL,
  READING_STATUS,
  READING_STATUS_LABEL,
} from "@/lib/constants";
import { toDateInput } from "@/lib/format";
import { simpanSampul } from "@/services/storage";
import { validasiBuku, type KesalahanForm, type NilaiFormBuku } from "@/utils/validation";
import { pesanError } from "@/utils/error";
import type { Book } from "@/types";

function nilaiAwalKosong(): NilaiFormBuku {
  return {
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publicationYear: null,
    edition: "",
    language: "Indonesia",
    categoryId: null,
    description: "",
    pageCount: null,
    coverImageUrl: null,
    coverThumbUrl: null,
    condition: "baik",
    storageLocationId: null,
    readingStatus: "belum_dibaca",
    ownershipStatus: "dimiliki",
    rating: null,
    notes: "",
    acquiredDate: toDateInput(new Date()),
    berkasSampul: null,
  };
}

export interface PropFormBuku {
  mode: "tambah" | "ubah";
  buku?: Book | null;
  /** Nilai pratanpa (mis. hasil pencarian ISBN) untuk mode tambah. */
  pratanpa?: Partial<NilaiFormBuku>;
  onSimpanDanTambahLagi?: (buku: Book) => void;
}

export function BookForm({ mode, buku, pratanpa, onSimpanDanTambahLagi }: PropFormBuku) {
  const navigate = useNavigate();
  const toast = useToast();
  const { userId } = useAuth();
  const [nilai, setNilai] = useState<NilaiFormBuku>(() => ({
    ...nilaiAwalKosong(),
    ...(pratanpa ?? {}),
    ...(buku
      ? ({
          title: buku.title,
          author: buku.author ?? "",
          isbn: buku.isbn ?? "",
          publisher: buku.publisher ?? "",
          publicationYear: buku.publicationYear,
          edition: buku.edition ?? "",
          language: buku.language ?? "",
          categoryId: buku.categoryId,
          description: buku.description ?? "",
          pageCount: buku.pageCount,
          coverImageUrl: buku.coverImageUrl,
          coverThumbUrl: buku.coverThumbUrl,
          condition: buku.condition,
          storageLocationId: buku.storageLocationId,
          readingStatus: buku.readingStatus,
          ownershipStatus: buku.ownershipStatus,
          rating: buku.rating,
          notes: buku.notes ?? "",
          acquiredDate: toDateInput(buku.acquiredDate),
        } as Partial<NilaiFormBuku>)
      : {}),
  }));
  const [error, setError] = useState<KesalahanForm>({});
  const [sampulBaru, setSampulBaru] = useState<{
    file: File;
    dataUrl: string;
    thumbDataUrl: string;
  } | null>(null);

  const simpan = useSimpanBuku();
  const ubah = useUbahBuku();

  const set = <K extends keyof NilaiFormBuku>(kunci: K, isi: NilaiFormBuku[K]) => {
    setNilai((n) => ({ ...n, [kunci]: isi }));
    setError((e) => {
      if (!e[kunci as string]) return e;
      const baru = { ...e };
      delete baru[kunci as string];
      return baru;
    });
  };

  const bersihkanAngka = (isi: string): number | null =>
    isi.trim() === "" ? null : Number(isi.replace(/\D/g, "")) || null;

  const kirim = async (tambahLagi = false) => {
    const kesalahan = validasiBuku(nilai);
    if (Object.keys(kesalahan).length > 0) {
      setError(kesalahan);
      toast.peringatan(
        "Formulir belum lengkap",
        "Periksa kembali kolom yang ditandai merah."
      );
      const elemen = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      elemen?.focus();
      elemen?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      let coverImageUrl = nilai.coverImageUrl;
      let coverThumbUrl = nilai.coverThumbUrl;
      if (sampulBaru) {
        const hasil = await simpanSampul(sampulBaru.file, userId);
        coverImageUrl = hasil.coverImageUrl;
        coverThumbUrl = hasil.coverThumbUrl;
      }

      const payload = { ...nilai, coverImageUrl, coverThumbUrl };
      delete (payload as Partial<NilaiFormBuku>).berkasSampul;

      const hasil = mode === "ubah" && buku
        ? await ubah.mutateAsync({ id: buku.id, input: payload })
        : await simpan.mutateAsync(payload);

      if (mode === "ubah") {
        toast.sukses("Perubahan disimpan", `Data buku "${hasil.title}" berhasil diperbarui.`);
        navigate(`/buku/${hasil.id}`);
        return;
      }

      if (tambahLagi) {
        toast.sukses("Buku disimpan", `"${hasil.title}" masuk ke koleksi. Lanjutkan menambah buku.`);
        setNilai({ ...nilaiAwalKosong(), acquiredDate: nilai.acquiredDate });
        setSampulBaru(null);
        onSimpanDanTambahLagi?.(hasil);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      toast.sukses("Buku disimpan", `"${hasil.title}" berhasil ditambahkan ke koleksi.`);
      navigate(`/buku/${hasil.id}`);
    } catch (err) {
      toast.gagal(
        mode === "ubah" ? "Gagal menyimpan perubahan" : "Gagal menyimpan buku",
        pesanError(err, "Data Anda tetap tersimpan di formulir, silakan coba lagi.")
      );
    }
  };

  const sedangProses = simpan.isPending || ubah.isPending;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void kirim(false);
      }}
      noValidate
      className="space-y-6"
    >
      <Card>
        <CardHeader
          judul="Informasi buku"
          deskripsi="Hanya judul yang wajib diisi, kolom lain boleh dikosongkan."
        />
        <CardBody className="grid gap-5 lg:grid-cols-2">
          <Field
            label="Judul buku"
            htmlFor="judul"
            wajib
            pesanError={error.title}
            className="lg:col-span-2"
          >
            <Input
              id="judul"
              value={nilai.title}
              onChange={(e) => set("title", e.target.value)}
              pesanError={error.title}
              placeholder="misal Bumi Manusia"
              maxLength={300}
              autoComplete="off"
            />
          </Field>

          <Field label="Penulis" htmlFor="penulis" pesanError={error.author}>
            <Input
              id="penulis"
              value={nilai.author ?? ""}
              onChange={(e) => set("author", e.target.value)}
              pesanError={error.author}
              placeholder="misal Pramoedya Ananta Toer"
              maxLength={200}
              autoComplete="off"
            />
          </Field>

          <Field label="ISBN" htmlFor="isbn" pesanError={error.isbn} petunjuk={error.isbn ? undefined : "10 atau 13 digit, tanpa tanda hubung."}>
            <Input
              id="isbn"
              value={nilai.isbn ?? ""}
              onChange={(e) => set("isbn", e.target.value)}
              pesanError={error.isbn}
              inputMode="numeric"
              placeholder="9786024246945"
            />
          </Field>

          <Field label="Penerbit" htmlFor="penerbit">
            <Input
              id="penerbit"
              value={nilai.publisher ?? ""}
              onChange={(e) => set("publisher", e.target.value)}
              placeholder="misal Gramedia"
              maxLength={150}
            />
          </Field>

          <Field label="Tahun terbit" htmlFor="tahun" pesanError={error.publicationYear}>
            <Input
              id="tahun"
              value={nilai.publicationYear ?? ""}
              onChange={(e) => set("publicationYear", bersihkanAngka(e.target.value))}
              pesanError={error.publicationYear}
              inputMode="numeric"
              placeholder="2019"
              maxLength={4}
            />
          </Field>

          <Field label="Edisi atau cetakan" htmlFor="edisi">
            <Input
              id="edisi"
              value={nilai.edition ?? ""}
              onChange={(e) => set("edition", e.target.value)}
              placeholder="misal Cetakan ke-3"
              maxLength={80}
            />
          </Field>

          <Field label="Bahasa" htmlFor="bahasa">
            <Select
              id="bahasa"
              value={nilai.language ?? ""}
              onChange={(e) => set("language", e.target.value)}
            >
              <option value="">Pilih bahasa</option>
              {LANGUAGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Jumlah halaman" htmlFor="halaman" pesanError={error.pageCount}>
            <Input
              id="halaman"
              value={nilai.pageCount ?? ""}
              onChange={(e) => set("pageCount", bersihkanAngka(e.target.value))}
              pesanError={error.pageCount}
              inputMode="numeric"
              placeholder="340"
              maxLength={5}
            />
          </Field>

          <Field
            label="Deskripsi"
            htmlFor="deskripsi"
            pesanError={error.description}
            className="lg:col-span-2"
          >
            <Textarea
              id="deskripsi"
              value={nilai.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Sinopsis atau ringkasan singkat isi buku"
              maxLength={5000}
              className="min-h-28"
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader judul="Kondisi &amp; lokasi" deskripsi="Bantu mengingat letak buku di rumah." />
        <CardBody className="grid gap-5 lg:grid-cols-2">
          <Field label="Kondisi buku" htmlFor="kondisi">
            <Select
              id="kondisi"
              value={nilai.condition ?? ""}
              onChange={(e) => set("condition", e.target.value as NilaiFormBuku["condition"])}
            >
              <option value="">Pilih kondisi</option>
              {BOOK_CONDITION.map((k) => (
                <option key={k} value={k}>
                  {BOOK_CONDITION_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>

          <CategorySelect
            nilai={nilai.categoryId}
            ubah={(id) => set("categoryId", id)}
            pesanError={error.categoryId}
          />

          <LocationSelect
            nilai={nilai.storageLocationId}
            ubah={(id) => set("storageLocationId", id)}
            pesanError={error.storageLocationId}
          />

          <Field label="Tanggal membeli atau memperoleh" htmlFor="tanggal-diperoleh">
            <Input
              id="tanggal-diperoleh"
              type="date"
              value={nilai.acquiredDate ?? ""}
              onChange={(e) => set("acquiredDate", e.target.value || null)}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader judul="Status &amp; catatan pribadi" />
        <CardBody className="grid gap-5 lg:grid-cols-2">
          <Field label="Status membaca" htmlFor="status-baca">
            <Select
              id="status-baca"
              value={nilai.readingStatus ?? ""}
              onChange={(e) => set("readingStatus", e.target.value as NilaiFormBuku["readingStatus"])}
            >
              <option value="">Pilih status</option>
              {READING_STATUS.map((s) => (
                <option key={s} value={s}>
                  {READING_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status kepemilikan" htmlFor="status-milik">
            <Select
              id="status-milik"
              value={nilai.ownershipStatus ?? ""}
              onChange={(e) =>
                set("ownershipStatus", e.target.value as NilaiFormBuku["ownershipStatus"])
              }
            >
              <option value="">Pilih status</option>
              {OWNERSHIP_STATUS.map((s) => (
                <option key={s} value={s}>
                  {OWNERSHIP_STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="space-y-1.5 lg:col-span-2">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">Rating pribadi</p>
            <RatingInput nilai={nilai.rating} ubah={(n) => set("rating", n)} />
          </div>

          <Field
            label="Catatan pribadi"
            htmlFor="catatan"
            pesanError={error.notes}
            className="lg:col-span-2"
            petunjuk="Misal: halaman 40 ada noda kopi, atau dipinjam Rani bulan depan."
          >
            <Textarea
              id="catatan"
              value={nilai.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={2000}
              className="min-h-24"
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader judul="Foto sampul" deskripsi="Foto membuat buku lebih mudah dikenali." />
        <CardBody>
          <ImageUploader
            urlSaatIni={sampulBaru?.dataUrl ?? nilai.coverImageUrl}
            onSiap={setSampulBaru}
            onHapus={() => {
              setSampulBaru(null);
              set("coverImageUrl", null);
              set("coverThumbUrl", null);
            }}
          />
        </CardBody>
      </Card>

      <div className="sticky bottom-16 z-20 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-lg backdrop-blur sm:bottom-4 dark:border-stone-800 dark:bg-stone-900/95">
        <Button
          type="button"
          variasi="hantu"
          ikon={<X className="h-4 w-4" />}
          onClick={() => navigate(-1)}
        >
          Batal
        </Button>
        {mode === "tambah" && (
          <Button
            type="button"
            variasi="sekunder"
            ikon={<Sparkles className="h-4 w-4" />}
            onClick={() => void kirim(true)}
            disabled={sedangProses}
          >
            Simpan dan tambah lagi
          </Button>
        )}
        <Button type="submit" ikon={<Save className="h-4 w-4" />} memuat={sedangProses}>
          {mode === "ubah" ? "Simpan perubahan" : "Simpan buku"}
        </Button>
      </div>
    </form>
  );
}
