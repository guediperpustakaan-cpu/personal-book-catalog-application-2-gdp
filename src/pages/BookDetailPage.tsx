import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpenCheck,
  Check,
  Handshake,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBaris } from "@/components/ui/LoadingSkeleton";
import { TampilanRating } from "@/components/ui/RatingInput";
import { ConditionBadge, OwnershipBadge, StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import {
  useDetailBuku,
  useHapusBuku,
  useKategori,
  useLokasi,
  useUbahBuku,
  useUbahStatusBaca,
} from "@/hooks/useLibrary";
import { formatAngka, formatTanggal } from "@/lib/format";
import { pesanError } from "@/utils/error";
import type { ReadingStatus } from "@/types";

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: buku, isLoading, isError } = useDetailBuku(id);
  const { data: kategori = [] } = useKategori();
  const { data: lokasi = [] } = useLokasi();
  const ubahStatus = useUbahStatusBaca();
  const ubahBuku = useUbahBuku();
  const hapus = useHapusBuku();
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  if (isLoading) {
    return <SkeletonBaris jumlah={6} />;
  }

  if (isError || !buku) {
    return (
      <EmptyState
        judul="Buku tidak ditemukan"
        pesan="Buku ini mungkin sudah dihapus atau tautannya tidak valid."
        aksi={
          <Link to="/koleksi">
            <Button variasi="garis" ikon={<ArrowLeft className="h-4 w-4" />}>
              Kembali ke koleksi
            </Button>
          </Link>
        }
      />
    );
  }

  const kategoriBuku = kategori.find((k) => k.id === buku.categoryId);
  const lokasiBuku = lokasi.find((l) => l.id === buku.storageLocationId);

  const aturStatus = async (status: ReadingStatus) => {
    try {
      await ubahStatus.mutateAsync({ buku, status });
      toast.sukses("Status membaca diperbarui", `"${buku.title}" ditandai.`);
    } catch (err) {
      toast.gagal("Gagal mengubah status", pesanError(err));
    }
  };

  const tandaiDipinjamkan = async () => {
    const statusBaru = buku.ownershipStatus === "dipinjamkan" ? "dimiliki" : "dipinjamkan";
    try {
      await ubahBuku.mutateAsync({ id: buku.id, input: { ownershipStatus: statusBaru } });
      toast.sukses(
        statusBaru === "dipinjamkan" ? "Buku ditandai dipinjamkan" : "Buku kembali dimiliki",
        statusBaru === "dipinjamkan"
          ? "Jangan lupa catat detail peminjam di halaman Peminjaman."
          : undefined
      );
    } catch (err) {
      toast.gagal("Gagal mengubah status kepemilikan", pesanError(err));
    }
  };

  const bagikan = async () => {
    const teks = [
      buku.title,
      buku.author ? `Penulis: ${buku.author}` : null,
      buku.publisher ? `Penerbit: ${buku.publisher}` : null,
      buku.publicationYear ? `Tahun: ${buku.publicationYear}` : null,
      buku.isbn ? `ISBN: ${buku.isbn}` : null,
      lokasiBuku ? `Lokasi: ${lokasiBuku.name}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: buku.title, text: teks });
        return;
      }
      await navigator.clipboard.writeText(teks);
      toast.sukses("Informasi buku disalin", "Anda dapat menempelkannya di tempat lain.");
    } catch {
      toast.peringatan("Tidak dapat membagikan", "Peramban ini tidak mendukung fitur bagikan.");
    }
  };

  const konfirmasiHapusBuku = async () => {
    try {
      await hapus.mutateAsync(buku.id);
      toast.sukses("Buku dihapus", `"${buku.title}" dikeluarkan dari koleksi.`);
      navigate("/koleksi");
    } catch (err) {
      toast.gagal("Gagal menghapus buku", pesanError(err));
      setKonfirmasiHapus(false);
    }
  };

  const barisInfo: { label: string; nilai: string }[] = [
    { label: "Penulis", nilai: buku.author ?? "-" },
    { label: "ISBN", nilai: buku.isbn ?? "-" },
    { label: "Penerbit", nilai: buku.publisher ?? "-" },
    { label: "Tahun terbit", nilai: buku.publicationYear ? String(buku.publicationYear) : "-" },
    { label: "Edisi / cetakan", nilai: buku.edition ?? "-" },
    { label: "Bahasa", nilai: buku.language ?? "-" },
    { label: "Jumlah halaman", nilai: buku.pageCount ? `${formatAngka(buku.pageCount)} halaman` : "-" },
    { label: "Tanggal diperoleh", nilai: formatTanggal(buku.acquiredDate) },
    { label: "Ditambahkan", nilai: formatTanggal(buku.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/koleksi">
          <Button variasi="hantu" ukuran="kecil" ikon={<ArrowLeft className="h-4 w-4" />}>
            Kembali ke koleksi
          </Button>
        </Link>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variasi="garis"
            ukuran="kecil"
            ikon={<Share2 className="h-4 w-4" />}
            onClick={() => void bagikan()}
          >
            Bagikan
          </Button>
          <Link to={`/buku/${buku.id}/edit`}>
            <Button variasi="garis" ukuran="kecil" ikon={<Pencil className="h-4 w-4" />}>
              Ubah
            </Button>
          </Link>
          <Button
            variasi="bahaya"
            ukuran="kecil"
            ikon={<Trash2 className="h-4 w-4" />}
            onClick={() => setKonfirmasiHapus(true)}
          >
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <div className="mx-auto w-48 max-w-full lg:w-full">
            <BookCover
              judul={buku.title}
              url={buku.coverImageUrl ?? buku.coverThumbUrl}
              ukuran="besar"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <StatusBadge status={buku.readingStatus} />
            <OwnershipBadge status={buku.ownershipStatus} />
            <ConditionBadge kondisi={buku.condition} />
          </div>
          <div className="flex justify-center">
            <TampilanRating nilai={buku.rating} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {buku.title}
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {buku.author ?? "Penulis tidak diketahui"}
              {kategoriBuku ? ` · ${kategoriBuku.name}` : ""}
              {lokasiBuku ? ` · 📍 ${lokasiBuku.name}` : ""}
            </p>
          </div>

          <Card>
            <CardHeader
              judul="Tindakan cepat"
              deskripsi="Ubah status membaca dan status kepemilikan buku ini."
            />
            <CardBody className="flex flex-wrap gap-2">
              <Button
                variasi={buku.readingStatus === "sudah_dibaca" ? "utama" : "garis"}
                ukuran="kecil"
                ikon={<BookOpenCheck className="h-4 w-4" />}
                onClick={() => void aturStatus("sudah_dibaca")}
                disabled={ubahStatus.isPending}
              >
                Tandai sudah dibaca
              </Button>
              <Button
                variasi={buku.readingStatus === "sedang_dibaca" ? "utama" : "garis"}
                ukuran="kecil"
                ikon={<BookOpenCheck className="h-4 w-4" />}
                onClick={() => void aturStatus("sedang_dibaca")}
                disabled={ubahStatus.isPending}
              >
                Tandai sedang dibaca
              </Button>
              <Button
                variasi={buku.readingStatus === "belum_dibaca" ? "utama" : "garis"}
                ukuran="kecil"
                ikon={<ArrowLeft className="h-4 w-4 rotate-90" />}
                onClick={() => void aturStatus("belum_dibaca")}
                disabled={ubahStatus.isPending}
              >
                Tandai belum dibaca
              </Button>
              <Button
                variasi={buku.ownershipStatus === "dipinjamkan" ? "utama" : "garis"}
                ukuran="kecil"
                ikon={
                  buku.ownershipStatus === "dipinjamkan" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Handshake className="h-4 w-4" />
                  )
                }
                onClick={() => void tandaiDipinjamkan()}
                disabled={ubahBuku.isPending}
              >
                {buku.ownershipStatus === "dipinjamkan"
                  ? "Sudah kembali dimiliki"
                  : "Tandai dipinjamkan"}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader judul="Informasi buku" />
            <CardBody>
              <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                {barisInfo.map((b) => (
                  <div key={b.label} className="min-w-0">
                    <dt className="text-xs uppercase tracking-wide text-stone-400">{b.label}</dt>
                    <dd className="mt-0.5 text-sm text-stone-800 dark:text-stone-100">{b.nilai}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          {buku.description && (
            <Card>
              <CardHeader judul="Deskripsi" />
              <CardBody>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {buku.description}
                </p>
              </CardBody>
            </Card>
          )}

          {buku.notes && (
            <Card>
              <CardHeader judul="Catatan pribadi" />
              <CardBody>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {buku.notes}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        terbuka={konfirmasiHapus}
        tutup={() => setKonfirmasiHapus(false)}
        judul="Hapus buku ini?"
        pesan={`Buku "${buku.title}" akan dihapus permanen dari koleksi. Tindakan ini tidak dapat dibatalkan.`}
        memuat={hapus.isPending}
        onKonfirmasi={() => void konfirmasiHapusBuku()}
      />
    </div>
  );
}
