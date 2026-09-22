import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import {
  BOOK_CONDITION,
  BOOK_CONDITION_LABEL,
  OWNERSHIP_STATUS,
  OWNERSHIP_STATUS_LABEL,
  PAGE_SIZE_OPTIONS,
  READING_STATUS,
  READING_STATUS_LABEL,
  SORT_OPTIONS,
} from "@/lib/constants";
import { formatAngka } from "@/lib/format";
import type {
  BookSortField,
  Category,
  SortDirection,
  StorageLocation,
} from "@/types";

export interface NilaiFilter {
  kategori: string;
  lokasi: string;
  kondisi: string;
  statusBaca: string;
  kepemilikan: string;
  urut: BookSortField;
  arah: SortDirection;
  jumlah: number;
}

export function FilterPanel({
  nilai,
  ubah,
  kategori,
  lokasi,
  jumlahHasil,
  totalBuku,
  jumlahAktif,
  onReset,
}: {
  nilai: NilaiFilter;
  ubah: (perubahan: Partial<NilaiFilter>) => void;
  kategori: Category[];
  lokasi: StorageLocation[];
  jumlahHasil: number;
  totalBuku: number;
  jumlahAktif: number;
  onReset: () => void;
}) {
  return (
    <section
      aria-label="Filter dan urutan"
      className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filter &amp; urutan
          {jumlahAktif > 0 && (
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {jumlahAktif} aktif
            </span>
          )}
        </p>
        {jumlahAktif > 0 && (
          <Button variasi="hantu" ukuran="kecil" ikon={<X className="h-3.5 w-3.5" />} onClick={onReset}>
            Atur ulang
          </Button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FilterSelect
          id="filter-kategori"
          label="Kategori"
          value={nilai.kategori}
          onChange={(v) => ubah({ kategori: v })}
          opsi={kategori.map((k) => ({ nilai: k.id, label: k.name }))}
        />
        <FilterSelect
          id="filter-lokasi"
          label="Lokasi penyimpanan"
          value={nilai.lokasi}
          onChange={(v) => ubah({ lokasi: v })}
          opsi={lokasi.map((l) => ({ nilai: l.id, label: l.name }))}
        />
        <FilterSelect
          id="filter-kondisi"
          label="Kondisi"
          value={nilai.kondisi}
          onChange={(v) => ubah({ kondisi: v })}
          opsi={BOOK_CONDITION.map((k) => ({ nilai: k, label: BOOK_CONDITION_LABEL[k] }))}
        />
        <FilterSelect
          id="filter-status"
          label="Status membaca"
          value={nilai.statusBaca}
          onChange={(v) => ubah({ statusBaca: v })}
          opsi={READING_STATUS.map((s) => ({ nilai: s, label: READING_STATUS_LABEL[s] }))}
        />
        <FilterSelect
          id="filter-kepemilikan"
          label="Status kepemilikan"
          value={nilai.kepemilikan}
          onChange={(v) => ubah({ kepemilikan: v })}
          opsi={OWNERSHIP_STATUS.map((s) => ({ nilai: s, label: OWNERSHIP_STATUS_LABEL[s] }))}
        />
        <FilterSelect
          id="urut-berdasarkan"
          label="Urutkan berdasarkan"
          value={nilai.urut}
          onChange={(v) => ubah({ urut: v as BookSortField })}
          opsi={SORT_OPTIONS.map((s) => ({ nilai: s.value, label: s.label }))}
        />
        <FilterSelect
          id="arah-urut"
          label="Arah urutan"
          value={nilai.arah}
          onChange={(v) => ubah({ arah: v as SortDirection })}
          opsi={[
            { nilai: "desc", label: "Menurun (terbaru/terbesar)" },
            { nilai: "asc", label: "Menaik (terlama/terkecil)" },
          ]}
        />
        <FilterSelect
          id="jumlah-per-halaman"
          label="Buku per halaman"
          value={String(nilai.jumlah)}
          onChange={(v) => ubah({ jumlah: Number(v) })}
          opsi={PAGE_SIZE_OPTIONS.map((n) => ({ nilai: String(n), label: `${n} buku` }))}
        />
      </div>

      <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
        Menampilkan {formatAngka(jumlahHasil)} dari {formatAngka(totalBuku)} buku.
      </p>
    </section>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  opsi,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (nilai: string) => void;
  opsi: { nilai: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-stone-600 dark:text-stone-300">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 py-0">
        <option value="">Semua</option>
        {opsi.map((o) => (
          <option key={o.nilai} value={o.nilai}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
