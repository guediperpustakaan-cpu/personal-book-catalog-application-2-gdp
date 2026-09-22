import { useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, LogIn, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { pesanError } from "@/utils/error";

type Mode = "masuk" | "daftar" | "atur-ulang";

const JUDUL: Record<Mode, { judul: string; pesan: string; tombol: string }> = {
  masuk: { judul: "Masuk ke akun", pesan: "Kelola koleksi buku Anda.", tombol: "Masuk" },
  daftar: { judul: "Buat akun baru", pesan: "Simpan koleksi buku secara daring.", tombol: "Daftar" },
  "atur-ulang": {
    judul: "Atur ulang kata sandi",
    pesan: "Kami akan mengirim tautan pemulihan ke email Anda.",
    tombol: "Kirim tautan",
  },
};

export default function AuthPage({ mode }: { mode: Mode }) {
  const { masuk, daftar, aturUlangKataSandi, mode: modeBackend } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [nama, setNama] = useState("");
  const [memuat, setMemuat] = useState(false);

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modeBackend === "lokal") {
      toast.info(
        "Mode penyimpanan lokal",
        "Aplikasi ini berjalan tanpa akun. Data tersimpan di perangkat ini."
      );
      return;
    }
    if (!email.trim() || (mode !== "atur-ulang" && kataSandi.length < 6)) {
      toast.peringatan(
        "Data belum lengkap",
        "Isi email dengan benar dan kata sandi minimal 6 karakter."
      );
      return;
    }
    setMemuat(true);
    try {
      if (mode === "masuk") await masuk(email.trim(), kataSandi);
      else if (mode === "daftar") await daftar(email.trim(), kataSandi, nama.trim());
      else await aturUlangKataSandi(email.trim());
      toast.sukses(
        mode === "atur-ulang" ? "Tautan terkirim" : "Berhasil",
        mode === "atur-ulang"
          ? "Periksa kotak masuk email Anda."
          : "Selamat datang kembali di BukuRumah."
      );
    } catch (err) {
      toast.gagal("Gagal memproses permintaan", pesanError(err));
    } finally {
      setMemuat(false);
    }
  };

  const teks = JUDUL[mode];

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10 dark:bg-stone-950">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
            aria-hidden="true"
          >
            <BookMarked className="h-7 w-7" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{APP_NAME}</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Katalog buku pribadi di rumah Anda
            </p>
          </div>
        </div>

        <Card>
          <CardBody className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{teks.judul}</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">{teks.pesan}</p>
            </div>

            {modeBackend === "lokal" && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                Aplikasi saat ini berjalan dalam mode penyimpanan lokal sehingga tidak memerlukan
                akun. Untuk memakai akun, isi variabel <code>VITE_SUPABASE_URL</code> dan{" "}
                <code>VITE_SUPABASE_ANON_KEY</code> pada berkas <code>.env</code>.
              </p>
            )}

            <form onSubmit={kirim} className="space-y-4">
              {mode === "daftar" && (
                <Field label="Nama lengkap" htmlFor="auth-nama">
                  <Input
                    id="auth-nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    autoComplete="name"
                  />
                </Field>
              )}
              <Field label="Email" htmlFor="auth-email" wajib>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="nama@email.com"
                />
              </Field>
              {mode !== "atur-ulang" && (
                <Field label="Kata sandi" htmlFor="auth-sandi" wajib petunjuk="Minimal 6 karakter.">
                  <Input
                    id="auth-sandi"
                    type="password"
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    autoComplete={mode === "daftar" ? "new-password" : "current-password"}
                  />
                </Field>
              )}
              <Button
                type="submit"
                lebarPenuh
                memuat={memuat}
                ikon={
                  mode === "daftar" ? (
                    <UserPlus className="h-4 w-4" />
                  ) : mode === "atur-ulang" ? (
                    <Mail className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )
                }
              >
                {teks.tombol}
              </Button>
            </form>

            <div className="flex flex-wrap justify-between gap-2 text-sm">
              {mode !== "masuk" && (
                <Link to="/login" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Sudah punya akun? Masuk
                </Link>
              )}
              {mode !== "daftar" && (
                <Link to="/register" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  Belum punya akun? Daftar
                </Link>
              )}
              {mode !== "atur-ulang" && (
                <Link
                  to="/reset-password"
                  className="font-medium text-stone-500 hover:underline dark:text-stone-400"
                >
                  Lupa kata sandi?
                </Link>
              )}
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-sm">
          <Link to="/" className="font-medium text-stone-500 hover:underline dark:text-stone-400">
            ← Kembali ke aplikasi
          </Link>
        </p>
      </div>
    </div>
  );
}
