import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";

/** Kerangka halaman: sidebar di desktop, navigasi bawah di ponsel. */
export function AppLayout() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Langsung ke konten utama
      </a>
      <div className="flex">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main
            id="konten-utama"
            className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:pb-10"
          >
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
