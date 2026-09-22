import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { SkeletonStatistik } from "@/components/ui/LoadingSkeleton";

/** Halaman dimuat malas (lazy) agar bundle awal tetap ringan. */
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const BooksPage = lazy(() => import("@/pages/BooksPage"));
const BookAddPage = lazy(() => import("@/pages/BookAddPage"));
const BookDetailPage = lazy(() => import("@/pages/BookDetailPage"));
const BookEditPage = lazy(() => import("@/pages/BookEditPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const LocationsPage = lazy(() => import("@/pages/LocationsPage"));
const LoansPage = lazy(() => import("@/pages/LoansPage"));
const StatisticsPage = lazy(() => import("@/pages/StatisticsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));

function Pemuat() {
  return (
    <div className="space-y-6" role="status" aria-label="Memuat halaman">
      <span className="sr-only">Halaman sedang dimuat…</span>
      <SkeletonStatistik />
      <div className="h-64 w-full animate-shimmer rounded-2xl bg-stone-200/70 dark:bg-stone-800/70" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <HashRouter>
      <Suspense fallback={<Pemuat />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/koleksi" element={<BooksPage />} />
            <Route path="/buku/tambah" element={<BookAddPage />} />
            <Route path="/buku/:id" element={<BookDetailPage />} />
            <Route path="/buku/:id/edit" element={<BookEditPage />} />
            <Route path="/kategori" element={<CategoriesPage />} />
            <Route path="/lokasi" element={<LocationsPage />} />
            <Route path="/peminjaman" element={<LoansPage />} />
            <Route path="/statistik" element={<StatisticsPage />} />
            <Route path="/pengaturan" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="/login" element={<AuthPage mode="masuk" />} />
          <Route path="/register" element={<AuthPage mode="daftar" />} />
          <Route path="/reset-password" element={<AuthPage mode="atur-ulang" />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
