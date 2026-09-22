import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BookForm } from "@/components/BookForm";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonBaris } from "@/components/ui/LoadingSkeleton";
import { useDetailBuku } from "@/hooks/useLibrary";

export default function BookEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: buku, isLoading, isError } = useDetailBuku(id);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <SkeletonBaris jumlah={6} />
      </div>
    );
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

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">Anda sedang mengubah</p>
            <p className="text-base font-semibold text-stone-900 dark:text-stone-50">{buku.title}</p>
          </div>
          <Link to={`/buku/${buku.id}`}>
            <Button variasi="garis" ikon={<ArrowLeft className="h-4 w-4" />}>
              Batal dan lihat detail
            </Button>
          </Link>
        </CardBody>
      </Card>

      <BookForm mode="ubah" buku={buku} />
    </div>
  );
}
