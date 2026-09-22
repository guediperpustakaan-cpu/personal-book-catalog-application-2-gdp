import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Tema = "terang" | "gelap";
export type UkuranTampilan = "rapat" | "normal" | "lapang";

interface NilaiTema {
  tema: Tema;
  ukuran: UkuranTampilan;
  ubahTema: (t: Tema) => void;
  ubahUkuran: (u: UkuranTampilan) => void;
}

const KUNCI_TEMA = "bukurumah.tema";
const KUNCI_UKURAN = "bukurumah.ukuran";

const KonteksTema = createContext<NilaiTema | null>(null);

function temaAwal(): Tema {
  const tersimpan = localStorage.getItem(KUNCI_TEMA);
  if (tersimpan === "terang" || tersimpan === "gelap") return tersimpan;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "gelap" : "terang";
}

function ukuranAwal(): UkuranTampilan {
  const tersimpan = localStorage.getItem(KUNCI_UKURAN);
  if (tersimpan === "rapat" || tersimpan === "lapang") return tersimpan;
  return "normal";
}

const kelasUkuran: Record<UkuranTampilan, string> = {
  rapat: "density-compact",
  normal: "density-normal",
  lapang: "density-comfortable",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => temaAwal());
  const [ukuran, setUkuran] = useState<UkuranTampilan>(() => ukuranAwal());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", tema === "gelap");
    root.classList.toggle("light", tema === "terang");
    root.style.colorScheme = tema;
    localStorage.setItem(KUNCI_TEMA, tema);
  }, [tema]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...Object.values(kelasUkuran));
    root.classList.add(kelasUkuran[ukuran]);
    localStorage.setItem(KUNCI_UKURAN, ukuran);
  }, [ukuran]);

  const ubahTema = useCallback((t: Tema) => setTema(t), []);
  const ubahUkuran = useCallback((u: UkuranTampilan) => setUkuran(u), []);

  const nilai = useMemo(
    () => ({ tema, ukuran, ubahTema, ubahUkuran }),
    [tema, ukuran, ubahTema, ubahUkuran]
  );

  return <KonteksTema.Provider value={nilai}>{children}</KonteksTema.Provider>;
}

export function useTema(): NilaiTema {
  const ctx = useContext(KonteksTema);
  if (!ctx) throw new Error("useTema harus dipakai di dalam ThemeProvider.");
  return ctx;
}
