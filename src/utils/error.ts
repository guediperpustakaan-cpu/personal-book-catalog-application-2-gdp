const PESAN_SCHEMA_BELUM_ADA =
  "Skema database belum dibuat. Jalankan berkas migration (supabase/migrations/0001_skema_awal.sql) " +
  "pada SQL Editor Supabase terlebih dahulu.";

/**
 * Ubah berbagai bentuk pesan error menjadi teks yang mudah dipahami.
 * Bila skema database Supabase belum dibuat, tampilkan pesan jelas
 * (bukan teks error mentah dari PostgREST) beserta cara memperbaikinya.
 */
export function pesanError(err: unknown, cadangan = "Terjadi kesalahan tak terduga."): string {
  const teksError = ambilPesan(err);
  if (skemaBelumAda(err, teksError)) return PESAN_SCHEMA_BELUM_ADA;
  return teksError ?? cadangan;
}

function ambilPesan(err: unknown): string | null {
  if (!err) return null;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || null;
  if (typeof err === "object") {
    if ("message" in err) {
      const m = (err as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
    if ("error" in err) {
      const e = (err as { error?: unknown }).error;
      if (typeof e === "string") return e;
      if (e && typeof e === "object" && "message" in e) {
        const m = (e as { message?: unknown }).message;
        if (typeof m === "string" && m.trim()) return m;
      }
    }
  }
  return null;
}

/**
 * PostgREST membalas PGRST205 ("Could not find the table ... in the schema
 * cache") ketika tabel memang belum dibuat di database.
 */
function skemaBelumAda(err: unknown, pesan: string | null): boolean {
  if (err && typeof err === "object" && "code" in err) {
    const kode = (err as { code?: unknown }).code;
    if (typeof kode === "string" && /^PGRST20[0-9]$/i.test(kode.trim())) return true;
  }
  if (!pesan) return false;
  const kodeMatch = /"code"\s*:\s*"PGRST20[0-9]"/i.test(pesan);
  return (
    kodeMatch ||
    /Could not find the table .* in the schema cache/i.test(pesan) ||
    /relation ".*" does not exist/i.test(pesan)
  );
}
