import { MODE_BACKEND, getSupabase, isSupabaseAktif } from "@/integrations/supabase/client";
import { localBackend } from "@/services/localBackend";
import { supabaseBackend, unggahSampulKeStorage } from "@/services/supabaseBackend";
import type { DataService } from "@/services/types";

/**
 * Fasade layanan data. Aplikasi hanya berbicara dengan `dataService`,
 * sehingga berpindah dari mode lokal ke Supabase tidak mengubah UI.
 */
export const dataService: DataService =
  MODE_BACKEND === "supabase" ? supabaseBackend : localBackend;

export const modeBackend = dataService.mode;
export const supabaseAktif = isSupabaseAktif;
export { getSupabase, unggahSampulKeStorage };
