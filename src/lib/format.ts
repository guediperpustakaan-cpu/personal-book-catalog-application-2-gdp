/** Utilitas format tanggal, angka, dan teks mengikuti kaidah bahasa Indonesia. */

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateFmtShort = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYearFmt = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

const numberFmt = new Intl.NumberFormat("id-ID");

/** Contoh hasil: 21 September 2026 */
export function formatTanggal(value?: string | Date | null): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFmt.format(d);
}

/** Contoh hasil: 21 Sep 2026 */
export function formatTanggalPendek(value?: string | Date | null): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFmtShort.format(d);
}

/** Contoh hasil: Sep 2026 */
export function formatBulanTahun(value?: string | Date | null): string {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "-";
  return monthYearFmt.format(d);
}

export function formatAngka(value?: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return numberFmt.format(value);
}

/** 4.35 -> "4,4" */
export function formatDesimal(value?: number | null, digit = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digit,
  }).format(value);
}

export function formatPersen(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

/** Tanggal untuk input type="date" (YYYY-MM-DD). */
export function toDateInput(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export function selisihHari(target: string | Date): number {
  const d = typeof target === "string" ? new Date(target) : target;
  const now = new Date();
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86400000);
}

/** "3 hari lagi", "Terlambat 5 hari", "Jatuh tempo hari ini" */
export function deskripsiJatuhTempo(dueAt: string): string {
  const diff = selisihHari(dueAt);
  if (diff === 0) return "Jatuh tempo hari ini";
  if (diff > 0) return `${diff} hari lagi`;
  return `Terlambat ${Math.abs(diff)} hari`;
}

export function potongTeks(teks: string | null | undefined, maks = 140): string {
  if (!teks) return "";
  return teks.length > maks ? `${teks.slice(0, maks).trimEnd()}…` : teks;
}

export function inisial(teks: string): string {
  return teks
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function bersihkanIsbn(raw?: string | null): string {
  return (raw ?? "").replace(/[^0-9Xx]/g, "").toUpperCase();
}
