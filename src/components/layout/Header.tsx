import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Moon, ScanBarcode, Search, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTema } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { NAVIGASI_BAWAH } from "@/routes/navigation";

function judulHalaman(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/koleksi")) return "Koleksi Buku";
  if (pathname.startsWith("/buku/tambah")) return "Tambah Buku";
  if (pathname.includes("/edit")) return "Ubah Buku";
  if (pathname.startsWith("/buku/")) return "Detail Buku";
  if (pathname.startsWith("/kategori")) return "Kategori";
  if (pathname.startsWith("/lokasi")) return "Lokasi Penyimpanan";
  if (pathname.startsWith("/peminjaman")) return "Peminjaman";
  if (pathname.startsWith("/statistik")) return "Statistik";
  if (pathname.startsWith("/pengaturan")) return "Pengaturan";
  if (pathname.startsWith("/login")) return "Masuk";
  return "Halaman";
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { tema, ubahTema } = useTema();
  const { pengguna, keluar, mode } = useAuth();
  const toast = useToast();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-900/90">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
            {NAVIGASI_BAWAH.some((n) => n.ke === pathname) ? "Menu" : "Halaman"}
          </p>
          <h1 className="truncate text-lg font-semibold text-stone-900 sm:text-xl dark:text-stone-50">
            {judulHalaman(pathname)}
          </h1>
        </div>

        <Button
          variasi="hantu"
          ukuran="kecil"
          aria-label="Cari buku di koleksi"
          onClick={() => navigate("/koleksi")}
          className="hidden sm:inline-flex"
          ikon={<Search className="h-4 w-4" />}
        >
          Cari
        </Button>
        <Button
          variasi="hantu"
          ukuran="kecil"
          aria-label="Pindai ISBN dengan kamera"
          onClick={() => navigate("/koleksi?scan=1")}
          className="hidden sm:inline-flex"
          ikon={<ScanBarcode className="h-4 w-4" />}
        >
          Scan ISBN
        </Button>
        <Button
          variasi="hantu"
          ukuran="kecil"
          aria-label={tema === "gelap" ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
          onClick={() => ubahTema(tema === "gelap" ? "terang" : "gelap")}
          className="p-2.5"
        >
          {tema === "gelap" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>

        {mode === "supabase" && pengguna ? (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="max-w-32 truncate text-sm text-stone-600 dark:text-stone-300">
              {pengguna.nama}
            </span>
            <Button
              variasi="hantu"
              ukuran="kecil"
              aria-label="Keluar akun"
              className="p-2.5"
              onClick={async () => {
                await keluar();
                toast.info("Anda telah keluar", "Sampai jumpa lagi.");
              }}
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <Link
            to="/pengaturan"
            className="hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 sm:block dark:bg-stone-800 dark:text-stone-300"
          >
            {pengguna?.nama ?? "Pengguna"}
          </Link>
        )}
      </div>
    </header>
  );
}
