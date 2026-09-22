import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  Download,
  LogOut,
  Moon,
  RefreshCcw,
  Save,
  Sun,
  Trash2,
  Type,
} from "lucide-react";
import { CsvImport, tombolEksporCsv } from "@/components/CsvImport";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, Input, Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { useKategori, useLokasi, useUbahBuku } from "@/hooks/useLibrary";
import { useKoleksiPenuh } from "@/hooks/useStats";
import { useTema, type UkuranTampilan } from "@/hooks/useTheme";
import { formatAngka, formatTanggal } from "@/lib/format";
import { dataService, modeBackend } from "@/services/api";
import { unduhTeks } from "@/utils/csv";
import { pesanError } from "@/utils/error";

export default function SettingsPage() {
  const toast = useToast();
  const { tema, ukuran, ubahTema, ubahUkuran } = useTema();
  const { pengguna, keluar, mode, userId } = useAuth();
  const { data: buku = [] } = useKoleksiPenuh();
  const { data: kategori = [] } = useKategori();
  const { data: lokasi = [] } = useLokasi();
  const ubahBuku = useUbahBuku();
  const [nama, setNama] = useState(pengguna?.nama ?? "");
  const [konfirmasiReset, setKonfirmasiReset] = useState(false);

  const simpanProfil = async () => {
    if (!pengguna) return;
    try {
      const supabase = modeBackend === "supabase";
      if (supabase) {
        // Pembaruan nama disimpan pada metadata akun Supabase Auth.
        const { getSupabase } = await import("@/services/api");
        const klien = getSupabase();
        if (klien) {
          const { error } = await klien.auth.updateUser({ data: { full_name: nama } });
          if (error) throw error;
        }
      } else {
        localStorage.setItem("bukurumah.nama", nama);
      }
      toast.sukses("Profil disimpan", "Nama tampilan Anda sudah diperbarui.");
    } catch (err) {
      toast.gagal("Gagal menyimpan profil", pesanError(err));
    }
  };

  const eksporCsv = () => {
    if (buku.length === 0) {
      toast.peringatan("Belum ada data", "Tambahkan buku terlebih dahulu sebelum mengekspor.");
      return;
    }
    tombolEksporCsv(buku, kategori, lokasi);
    toast.sukses("Ekspor berhasil", `${formatAngka(buku.length)} buku diunduh dalam format CSV.`);
  };

  const backupJson = () => {
    const isi = JSON.stringify(
      { dieksporPada: new Date().toISOString(), versi: 1, buku, kategori, lokasi },
      null,
      2
    );
    unduhTeks(`cadangan-bukurumah-${new Date().toISOString().slice(0, 10)}.json`, isi, "application/json");
    toast.sukses("Cadangan dibuat", "Berkas cadangan berhasil diunduh.");
  };

  const perbaikiStatusPinjam = async () => {
    const pinjaman = await dataService.listLoans();
    const aktif = pinjaman.filter((p) => p.status === "dipinjam").map((p) => p.bookId);
    let jumlah = 0;
    for (const b of buku) {
      const seharusnya = aktif.includes(b.id) ? "dipinjamkan" : b.ownershipStatus;
      if (seharusnya && seharusnya !== b.ownershipStatus) {
        await ubahBuku.mutateAsync({ id: b.id, input: { ownershipStatus: seharusnya } });
        jumlah += 1;
      }
    }
    toast.info(
      "Penyelarasan selesai",
      jumlah > 0
        ? `${jumlah} buku diperbarui agar sesuai data peminjaman.`
        : "Semua status buku sudah sesuai data peminjaman."
    );
  };

  const resetData = async () => {
    try {
      if (dataService.resetLokal) {
        await dataService.resetLokal();
        toast.sukses("Data contoh dimuat ulang", "Aplikasi kembali ke data awal.");
      } else {
        toast.peringatan(
          "Tidak tersedia",
          "Mengatur ulang data hanya tersedia pada mode penyimpanan lokal."
        );
      }
      setKonfirmasiReset(false);
    } catch (err) {
      toast.gagal("Gagal mengatur ulang", pesanError(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          judul="Profil"
          deskripsi={
            mode === "supabase"
              ? "Akun terhubung dengan Supabase Auth."
              : "Aplikasi berjalan tanpa akun. Data tersimpan di perangkat ini."
          }
        />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama tampilan" htmlFor="nama-profil">
              <Input
                id="nama-profil"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama Anda"
              />
            </Field>
            <Field label="Email" htmlFor="email-profil" petunjuk="Email tidak dapat diubah di sini.">
              <Input id="email-profil" value={pengguna?.email ?? "-"} readOnly disabled />
            </Field>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button ikon={<Save className="h-4 w-4" />} onClick={() => void simpanProfil()}>
              Simpan profil
            </Button>
            {mode === "supabase" && (
              <Button
                variasi="garis"
                ikon={<LogOut className="h-4 w-4" />}
                onClick={async () => {
                  await keluar();
                  toast.info("Anda telah keluar", "Sampai jumpa lagi.");
                }}
              >
                Keluar akun
              </Button>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            ID penyimpanan: <code className="rounded bg-stone-100 px-1.5 py-0.5 dark:bg-stone-800">
              {userId ?? "-"}
            </code>
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader judul="Tampilan" deskripsi="Sesuaikan tema dan ukuran tampilan agar nyaman dibaca." />
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">Tema</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tema saat ini: {tema === "gelap" ? "Gelap" : "Terang"}
              </p>
            </div>
            <div
              role="group"
              aria-label="Pilih tema"
              className="flex overflow-hidden rounded-xl border border-stone-300 dark:border-stone-600"
            >
              <button
                type="button"
                onClick={() => ubahTema("terang")}
                aria-pressed={tema === "terang"}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${
                  tema === "terang"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-stone-600 dark:bg-stone-900 dark:text-stone-300"
                }`}
              >
                <Sun className="h-4 w-4" aria-hidden="true" /> Terang
              </button>
              <button
                type="button"
                onClick={() => ubahTema("gelap")}
                aria-pressed={tema === "gelap"}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium ${
                  tema === "gelap"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-stone-600 dark:bg-stone-900 dark:text-stone-300"
                }`}
              >
                <Moon className="h-4 w-4" aria-hidden="true" /> Gelap
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-stone-800 dark:text-stone-100">
                <Type className="h-4 w-4" aria-hidden="true" /> Ukuran tampilan
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Berguna jika teks terasa terlalu kecil atau terlalu besar.
              </p>
            </div>
            <div className="w-full sm:w-56">
              <label htmlFor="ukuran-tampilan" className="sr-only">
                Ukuran tampilan
              </label>
              <Select
                id="ukuran-tampilan"
                value={ukuran}
                onChange={(e) => ubahUkuran(e.target.value as UkuranTampilan)}
              >
                <option value="rapat">Rapat</option>
                <option value="normal">Normal</option>
                <option value="lapang">Lapang</option>
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          judul="Ekspor &amp; cadangan"
          deskripsi="Simpan salinan data koleksi Anda di luar aplikasi."
        />
        <CardBody className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variasi="garis" ikon={<Download className="h-4 w-4" />} onClick={eksporCsv}>
              Ekspor ke CSV
            </Button>
            <Button variasi="garis" ikon={<Database className="h-4 w-4" />} onClick={backupJson}>
              Cadangkan data (JSON)
            </Button>
            <Button
              variasi="garis"
              ikon={<RefreshCcw className="h-4 w-4" />}
              onClick={() => void perbaikiStatusPinjam()}
              disabled={ubahBuku.isPending}
            >
              Selaraskan status peminjaman
            </Button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Ekspor CSV menghasilkan {formatAngka(buku.length)} baris data. Berkas JSON berguna
            sebagai cadangan menyeluruh.
          </p>
        </CardBody>
      </Card>

      <CsvImport />

      <Card>
        <CardHeader
          judul="Pengelolaan kategori &amp; lokasi"
          deskripsi="Tambah, ubah, atau hapus daftar kategori dan lokasi."
        />
        <CardBody className="flex flex-wrap gap-2">
          <Link to="/kategori">
            <Button variasi="garis">Kelola kategori ({formatAngka(kategori.length)})</Button>
          </Link>
          <Link to="/lokasi">
            <Button variasi="garis">Kelola lokasi ({formatAngka(lokasi.length)})</Button>
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader judul="Penyimpanan data" deskripsi="Informasi cara data Anda disimpan." />
        <CardBody className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
          <p>
            Mode penyimpanan aktif:{" "}
            <strong>{modeBackend === "supabase" ? "Supabase (daring)" : "Lokal di perangkat"}</strong>
            .
          </p>
          <p>
            {modeBackend === "supabase"
              ? "Data disimpan di Supabase PostgreSQL dengan kebijakan Row Level Security sehingga hanya Anda yang dapat mengaksesnya."
              : "Seluruh data tersimpan di penyimpanan peramban pada perangkat ini. Untuk sinkron antar perangkat, hubungkan aplikasi ke Supabase melalui berkas .env."}
          </p>
          {modeBackend === "lokal" && (
            <div>
              <Button
                variasi="bahaya"
                ikon={<Trash2 className="h-4 w-4" />}
                onClick={() => setKonfirmasiReset(true)}
              >
                Atur ulang ke data contoh
              </Button>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Semua perubahan Anda akan diganti dengan data contoh bawaan. Terakhir dimuat:{" "}
                {formatTanggal(buku[0]?.createdAt ?? null)}.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        terbuka={konfirmasiReset}
        tutup={() => setKonfirmasiReset(false)}
        judul="Atur ulang data lokal?"
        pesan="Seluruh buku, kategori, lokasi, dan catatan peminjaman yang Anda buat akan diganti dengan data contoh bawaan. Pastikan Anda sudah membuat cadangan."
        teksKonfirmasi="Ya, atur ulang"
        onKonfirmasi={() => void resetData()}
      />
    </div>
  );
}
