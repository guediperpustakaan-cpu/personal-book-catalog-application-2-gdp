import { NavLink } from "react-router-dom";
import { BookMarked, ScanBarcode } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { NAVIGASI_SEKUNDER, NAVIGASI_UTAMA } from "@/routes/navigation";
import { modeBackend } from "@/services/api";
import { cn } from "@/utils/cn";
import type { ItemNavigasi } from "@/routes/navigation";

function ItemMenu({ item }: { item: ItemNavigasi }) {
  const Ikon = item.ikon;
  return (
    <NavLink
      to={item.ke}
      end={item.ke === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
        )
      }
    >
      <Ikon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:flex lg:flex-col dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center gap-3 px-5 py-5">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm"
          aria-hidden="true"
        >
          <BookMarked className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-semibold text-stone-900 dark:text-stone-50">{APP_NAME}</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Katalog buku pribadi</p>
        </div>
      </div>

      <nav aria-label="Navigasi utama" className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Menu
        </p>
        {NAVIGASI_UTAMA.map((item) => (
          <ItemMenu key={item.ke} item={item} />
        ))}
        <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          Pengelolaan
        </p>
        {NAVIGASI_SEKUNDER.map((item) => (
          <ItemMenu key={item.ke} item={item} />
        ))}
      </nav>

      <div className="space-y-2 border-t border-stone-200 p-3 dark:border-stone-800">
        <NavLink
          to="/koleksi?scan=1"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
        >
          <ScanBarcode className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Scan ISBN</span>
        </NavLink>
        <p className="px-3 text-[11px] leading-relaxed text-stone-400">
          Mode penyimpanan:{" "}
          <span className="font-medium text-stone-500 dark:text-stone-300">
            {modeBackend === "supabase" ? "Supabase (daring)" : "Lokal di perangkat ini"}
          </span>
        </p>
      </div>
    </aside>
  );
}
