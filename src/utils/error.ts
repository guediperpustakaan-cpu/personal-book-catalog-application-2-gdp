/** Ubah berbagai bentuk pesan error menjadi teks yang mudah dipahami. */
export function pesanError(err: unknown, cadangan = "Terjadi kesalahan tak terduga."): string {
  if (!err) return cadangan;
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message || cadangan;
  if (typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  if (typeof err === "object" && "error" in err) {
    const e = (err as { error?: unknown }).error;
    if (typeof e === "string") return e;
    if (e && typeof e === "object" && "message" in e) {
      const m = (e as { message?: unknown }).message;
      if (typeof m === "string" && m.trim()) return m;
    }
  }
  return cadangan;
}
