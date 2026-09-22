import { formatAngka } from "@/lib/format";
import { cn } from "@/utils/cn";

export interface DataGrafik {
  label: string;
  nilai: number;
  warna?: string;
}

const PALET = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f472b6",
  "#84cc16",
  "#6366f1",
  "#94a3b8",
];

/** Grafik batang sederhana berbasis div, responsif dan mudah dibaca. */
export function GrafikBatang({
  judul,
  data,
  kosong = "Belum ada data",
  horizontal = false,
}: {
  judul?: string;
  data: DataGrafik[];
  kosong?: string;
  horizontal?: boolean;
}) {
  const maks = Math.max(1, ...data.map((d) => d.nilai));

  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-stone-400">
        {kosong}
      </div>
    );
  }

  if (horizontal) {
    return (
      <div className="space-y-3">
        {judul && <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{judul}</p>}
        <ul className="space-y-2.5">
          {data.map((d, i) => (
            <li key={d.label} className="grid grid-cols-[minmax(84px,36%)_1fr_auto] items-center gap-3">
              <span className="truncate text-sm text-stone-600 dark:text-stone-300" title={d.label}>
                {d.label}
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <span
                  className="block h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(3, (d.nilai / maks) * 100)}%`,
                    backgroundColor: d.warna ?? PALET[i % PALET.length],
                  }}
                />
              </span>
              <span className="text-sm font-semibold tabular-nums text-stone-700 dark:text-stone-200">
                {formatAngka(d.nilai)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      {judul && <p className="mb-3 text-sm font-medium text-stone-500 dark:text-stone-400">{judul}</p>}
      <div className="flex h-48 items-end gap-2 overflow-x-auto pb-1">
        {data.map((d, i) => (
          <div key={d.label} className="flex min-w-10 flex-1 flex-col items-center gap-2">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
              {formatAngka(d.nilai)}
            </span>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: `${Math.max(4, (d.nilai / maks) * 100)}%`,
                minHeight: "6px",
                backgroundColor: d.warna ?? PALET[i % PALET.length],
              }}
              title={`${d.label}: ${formatAngka(d.nilai)}`}
            />
            <span className="w-full truncate text-center text-[11px] text-stone-500 dark:text-stone-400">
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Grafik garis/area ringan untuk melihat pertumbuhan koleksi. */
export function GrafikGaris({
  judul,
  data,
}: {
  judul?: string;
  data: { label: string; nilai: number }[];
}) {
  if (data.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-stone-400">
        Butuh minimal dua titik data untuk menampilkan grafik.
      </div>
    );
  }

  const lebar = 600;
  const tinggi = 180;
  const maks = Math.max(1, ...data.map((d) => d.nilai));
  const langkah = lebar / (data.length - 1);
  const titik = data.map((d, i) => ({
    x: i * langkah,
    y: tinggi - (d.nilai / maks) * (tinggi - 24) - 8,
  }));
  const garis = titik.map((t) => `${t.x.toFixed(1)},${t.y.toFixed(1)}`).join(" ");
  const area = `0,${tinggi} ${garis} ${lebar},${tinggi}`;

  return (
    <div>
      {judul && <p className="mb-2 text-sm font-medium text-stone-500 dark:text-stone-400">{judul}</p>}
      <svg
        viewBox={`0 0 ${lebar} ${tinggi}`}
        className="h-44 w-full"
        role="img"
        aria-label={`${judul ?? "Grafik"} pertumbuhan koleksi`}
      >
        <polyline points={area} fill="currentColor" className="text-indigo-100 dark:text-indigo-950" />
        <polyline
          points={garis}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-indigo-600 dark:text-indigo-400"
        />
        {titik.map((t, i) => (
          <circle
            key={i}
            cx={t.x}
            cy={t.y}
            r="3"
            className="fill-white stroke-indigo-600 dark:fill-stone-900"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
        <span>{data[0].label}</span>
        <span>{data[Math.floor(data.length / 2)].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

/** Lingkaran persentase sederhana untuk komposisi koleksi. */
export function GrafikPersen({
  nilai,
  label,
  warna = "#4f46e5",
}: {
  nilai: number;
  label: string;
  warna?: string;
}) {
  const putaran = Math.min(100, Math.max(0, nilai));
  return (
    <div className={cn("flex items-center gap-3")}>
      <div
        className="relative h-16 w-16 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${warna} ${putaran * 3.6}deg, rgba(120,113,108,0.18) 0deg)`,
        }}
        role="img"
        aria-label={`${label}: ${putaran}%`}
      >
        <div className="absolute inset-2 flex items-center justify-center rounded-full bg-white text-sm font-semibold text-stone-800 dark:bg-stone-900 dark:text-stone-100">
          {putaran}%
        </div>
      </div>
      <p className="text-sm text-stone-600 dark:text-stone-300">{label}</p>
    </div>
  );
}
