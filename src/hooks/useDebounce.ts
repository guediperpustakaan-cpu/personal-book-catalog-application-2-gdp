import { useEffect, useState } from "react";

/** Tunda eksekusi nilai (mis. kolom pencarian) agar request database berkurang. */
export function useDebounce<T>(nilai: T, jeda = 350): T {
  const [tunda, setTunda] = useState(nilai);
  useEffect(() => {
    const timer = setTimeout(() => setTunda(nilai), jeda);
    return () => clearTimeout(timer);
  }, [nilai, jeda]);
  return tunda;
}
