import {
  BarChart3,
  BookPlus,
  BookOpen,
  LayoutDashboard,
  MapPin,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ItemNavigasi {
  ke: string;
  label: string;
  ikon: LucideIcon;
  deskripsi?: string;
  utama?: boolean;
}

export const NAVIGASI_UTAMA: ItemNavigasi[] = [
  { ke: "/", label: "Dashboard", ikon: LayoutDashboard, deskripsi: "Ringkasan koleksi" },
  { ke: "/koleksi", label: "Koleksi Buku", ikon: BookOpen, deskripsi: "Semua buku" },
  { ke: "/buku/tambah", label: "Tambah Buku", ikon: BookPlus, deskripsi: "Catat buku baru" },
  { ke: "/peminjaman", label: "Peminjaman", ikon: Users, deskripsi: "Buku yang dipinjamkan" },
  { ke: "/statistik", label: "Statistik", ikon: BarChart3, deskripsi: "Grafik koleksi" },
];

export const NAVIGASI_SEKUNDER: ItemNavigasi[] = [
  { ke: "/kategori", label: "Kategori", ikon: Tags, deskripsi: "Kelompokkan buku" },
  { ke: "/lokasi", label: "Lokasi Penyimpanan", ikon: MapPin, deskripsi: "Tempat buku berada" },
  { ke: "/pengaturan", label: "Pengaturan", ikon: Settings, deskripsi: "Tema, impor, ekspor" },
];

export const NAVIGASI_BAWAH: ItemNavigasi[] = [
  { ke: "/", label: "Dashboard", ikon: LayoutDashboard },
  { ke: "/koleksi", label: "Koleksi", ikon: BookOpen },
  { ke: "/buku/tambah", label: "Tambah", ikon: BookPlus },
  { ke: "/peminjaman", label: "Pinjam", ikon: Users },
  { ke: "/pengaturan", label: "Atur", ikon: Settings },
];
