import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Konfigurasi Supabase.
 * Nilai diambil dari environment variable, tidak pernah ditulis langsung di kode.
 */
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseAktif = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseAktif) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export const MODE_BACKEND: "supabase" | "lokal" = isSupabaseAktif
  ? "supabase"
  : "lokal";
