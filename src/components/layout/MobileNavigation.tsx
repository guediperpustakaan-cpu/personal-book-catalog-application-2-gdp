import { NavLink } from "react-router-dom";
import { NAVIGASI_BAWAH } from "@/routes/navigation";
import { cn } from "@/utils/cn";

/** Navigasi bawah untuk ponsel, dengan ukuran sentuh yang cukup besar. */
export function MobileNavigation() {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/95"
    >
      <ul className="flex items-stretch justify-around">
        {NAVIGASI_BAWAH.map((item) => {
          const Ikon = item.ikon;
          return (
            <li key={item.ke} className="flex-1">
              <NavLink
                to={item.ke}
                end={item.ke === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-stone-500 dark:text-stone-400"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                        isActive && "bg-indigo-50 dark:bg-indigo-950/60"
                      )}
                      aria-hidden="true"
                    >
                      <Ikon className="h-5 w-5" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
