import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/hooks/useTheme";
import { ToastProvider } from "@/components/ui/Toast";
import { queryClient } from "@/lib/queryClient";
import { AppRoutes } from "@/routes/AppRoutes";

/**
 * Akar aplikasi BukuRumah.
 * Susunan penyedia:
 *  QueryClientProvider -> caching data (TanStack Query)
 *  ThemeProvider       -> tema terang/gelap + ukuran tampilan
 *  ToastProvider       -> notifikasi sukses/gagal
 *  AuthProvider        -> sesi pengguna (mode Supabase atau lokal)
 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
