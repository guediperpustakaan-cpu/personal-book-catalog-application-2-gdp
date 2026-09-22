import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useLokasi, useSimpanLokasi } from "@/hooks/useLibrary";
import { pesanError as teksError } from "@/utils/error";
import type { StorageLocation } from "@/types";

/** Pilihan lokasi penyimpanan, dapat menambah lokasi baru langsung. */
export function LocationSelect({
  nilai,
  ubah,
  pesanError,
  id = "lokasi",
}: {
  nilai: string | null;
  ubah: (id: string | null) => void;
  pesanError?: string;
  id?: string;
}) {
  const { data: lokasi = [], isLoading } = useLokasi();
  const [bukaModal, setBukaModal] = useState(false);
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const toast = useToast();
  const simpan = useSimpanLokasi();

  const tambah = async () => {
    const bersih = nama.trim();
    if (!bersih) return;
    try {
      const baru = await simpan.mutateAsync({
        name: bersih,
        description: keterangan.trim() || undefined,
      });
      ubah(baru.id);
      setNama("");
      setKeterangan("");
      setBukaModal(false);
      toast.sukses("Lokasi ditambahkan", `"${bersih}" siap dipakai.`);
    } catch (err) {
      toast.gagal("Gagal menambah lokasi", teksError(err));
    }
  };

  return (
    <>
      <Field label="Lokasi penyimpanan" htmlFor={id} pesanError={pesanError}>
        <div className="flex gap-2">
          <Select
            id={id}
            value={nilai ?? ""}
            onChange={(e) => ubah(e.target.value || null)}
            pesanError={pesanError}
            disabled={isLoading}
          >
            <option value="">Pilih lokasi</option>
            {lokasi.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>
          <Button
            variasi="garis"
            ikon={<Plus className="h-4 w-4" />}
            onClick={() => setBukaModal(true)}
            aria-label="Tambah lokasi baru"
            className="shrink-0"
          >
            <span className="hidden sm:inline">Baru</span>
          </Button>
        </div>
      </Field>

      <Modal
        terbuka={bukaModal}
        tutup={() => setBukaModal(false)}
        judul="Tambah lokasi penyimpanan"
        deskripsi="Sebutkan tempat fisik buku disimpan, misalnya Rak A atau Kardus 2."
        ukuran="kecil"
        aksi={
          <>
            <Button variasi="garis" onClick={() => setBukaModal(false)}>
              Batal
            </Button>
            <Button onClick={tambah} memuat={simpan.isPending} disabled={!nama.trim()}>
              Simpan lokasi
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama lokasi" htmlFor="nama-lokasi-baru" wajib>
            <Input
              id="nama-lokasi-baru"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="misal Lemari kamar"
              maxLength={60}
            />
          </Field>
          <Field
            label="Keterangan"
            htmlFor="keterangan-lokasi"
            petunjuk="Boleh dikosongkan. Contoh: rak paling bawah."
          >
            <Textarea
              id="keterangan-lokasi"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="min-h-16"
              maxLength={200}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}

export function usePetaLokasi() {
  const { data = [] } = useLokasi();
  const peta = new Map<string, StorageLocation>();
  data.forEach((l) => peta.set(l.id, l));
  return { daftar: data, peta };
}
