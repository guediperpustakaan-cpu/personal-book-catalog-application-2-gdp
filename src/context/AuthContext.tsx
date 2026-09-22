import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseAktif } from "@/integrations/supabase/client";

export interface InfoPengguna {
  id: string;
  email: string;
  nama: string;
}

interface NilaiAuth {
  /** "supabase" = wajib masuk akun, "lokal" = dipakai tanpa akun. */
  mode: "supabase" | "lokal";
  sedangMemuat: boolean;
  pengguna: InfoPengguna | null;
  userId: string | null;
  masuk: (email: string, kataSandi: string) => Promise<void>;
  daftar: (email: string, kataSandi: string, nama: string) => Promise<void>;
  keluar: () => Promise<void>;
  aturUlangKataSandi: (email: string) => Promise<void>;
}

const KonteksAuth = createContext<NilaiAuth | null>(null);

const PENGGUNA_DEMO: InfoPengguna = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "pemilik@lokal.id",
  nama: "Pemilik Koleksi",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [pengguna, setPengguna] = useState<InfoPengguna | null>(null);
  const [sedangMemuat, setSedangMemuat] = useState(isSupabaseAktif);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      // Mode lokal: aplikasi langsung siap tanpa proses masuk.
      setPengguna(PENGGUNA_DEMO);
      setSedangMemuat(false);
      return;
    }

    let aktif = true;

    const terapkan = (session: Session | null) => {
      if (!aktif) return;
      const user: User | null = session?.user ?? null;
      setPengguna(
        user
          ? {
              id: user.id,
              email: user.email ?? "",
              nama:
                (user.user_metadata?.full_name as string | undefined) ??
                user.email?.split("@")[0] ??
                "Pengguna",
            }
          : null
      );
      setSedangMemuat(false);
    };

    supabase.auth.getSession().then(({ data }) => terapkan(data.session));
    const { data: langganan } = supabase.auth.onAuthStateChange((_event, session) =>
      terapkan(session)
    );

    return () => {
      aktif = false;
      langganan.subscription.unsubscribe();
    };
  }, []);

  const masuk = useCallback(async (email: string, kataSandi: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password: kataSandi });
    if (error) throw new Error(terjemahkanError(error.message));
  }, []);

  const daftar = useCallback(async (email: string, kataSandi: string, nama: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.signUp({
      email,
      password: kataSandi,
      options: { data: { full_name: nama } },
    });
    if (error) throw new Error(terjemahkanError(error.message));
  }, []);

  const keluar = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const aturUlangKataSandi = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(terjemahkanError(error.message));
  }, []);

  const nilai = useMemo<NilaiAuth>(
    () => ({
      mode: isSupabaseAktif ? "supabase" : "lokal",
      sedangMemuat,
      pengguna,
      userId: pengguna?.id ?? null,
      masuk,
      daftar,
      keluar,
      aturUlangKataSandi,
    }),
    [sedangMemuat, pengguna, masuk, daftar, keluar, aturUlangKataSandi]
  );

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function useAuth(): NilaiAuth {
  const ctx = useContext(KonteksAuth);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider.");
  return ctx;
}

function terjemahkanError(pesan: string): string {
  const peta: [string, string][] = [
    ["Invalid login credentials", "Email atau kata sandi salah."],
    ["Email not confirmed", "Email belum diverifikasi. Periksa kotak masuk Anda."],
    ["User already registered", "Email sudah terdaftar. Silakan masuk."],
    ["Password should be at least", "Kata sandi minimal 6 karakter."],
    ["rate limit", "Terlalu banyak percobaan. Coba lagi beberapa saat lagi."],
  ];
  for (const [kunci, terjemahan] of peta) {
    if (pesan.toLowerCase().includes(kunci.toLowerCase())) return terjemahan;
  }
  return pesan;
}
