import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useKategori, useSimpanKategori } from "@/hooks/useLibrary";
import { pesanError as teksError } from "@/utils/error";
import type { Category } from "@/types";

/** Pilihan kategori dengan kemampuan menambah kategori baru langsung. */
export function CategorySelect({
  nilai,
  ubah,
  pesanError,
  id = "kategori",
}: {
  nilai: string | null;
  ubah: (id: string | null) => void;
  pesanError?: string;
  id?: string;
}) {
  const { data: kategori = [], isLoading } = useKategori();
  const [bukaModal, setBukaModal] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const toast = useToast();
  const simpan = useSimpanKategori();

  const tambah = async () => {
    const nama = namaBaru.trim();
    if (!nama) return;
    try {
      const baru = await simpan.mutateAsync(nama);
      ubah(baru.id);
      setNamaBaru("");
      setBukaModal(false);
      toast.sukses("Kategori ditambahkan", `"${nama}" siap dipakai.`);
    } catch (err) {
      toast.gagal("Gagal menambah kategori", teksError(err));
    }
  };

  return (
    <>
      <Field label="Kategori" htmlFor={id} pesanError={pesanError}>
        <div className="flex gap-2">
          <Select
            id={id}
            value={nilai ?? ""}
            onChange={(e) => ubah(e.target.value || null)}
            pesanError={pesanError}
            disabled={isLoading}
          >
            <option value="">Pilih kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </Select>
          <Button
            variasi="garis"
            ikon={<Plus className="h-4 w-4" />}
            onClick={() => setBukaModal(true)}
            aria-label="Tambah kategori baru"
            className="shrink-0"
          >
            <span className="hidden sm:inline">Baru</span>
          </Button>
        </div>
      </Field>

      <Modal
        terbuka={bukaModal}
        tutup={() => setBukaModal(false)}
        judul="Tambah kategori baru"
        deskripsi="Contoh: Fiksi, Teknologi, atau Resep Masakan."
        ukuran="kecil"
        aksi={
          <>
            <Button variasi="garis" onClick={() => setBukaModal(false)}>
              Batal
            </Button>
            <Button onClick={tambah} memuat={simpan.isPending} disabled={!namaBaru.trim()}>
              Simpan kategori
            </Button>
          </>
        }
      >
        <Field label="Nama kategori" htmlFor="nama-kategori-baru" wajib>
          <Input
            id="nama-kategori-baru"
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void tambah();
              }
            }}
            placeholder="misal Sejarah Indonesia"
            maxLength={60}
          />
        </Field>
      </Modal>
    </>
  );
}

export function usePetaKategori() {
  const { data = [] } = useKategori();
  const peta = new Map<string, Category>();
  data.forEach((k) => peta.set(k.id, k));
  return { daftar: data, peta };
}
