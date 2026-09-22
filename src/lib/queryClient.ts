import { QueryClient } from "@tanstack/react-query";

/** Konfigurasi caching: data sederhana di-cache agar permintaan berulang berkurang. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      placeholderData: (data: unknown) => data,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const KUNCI_QUERY = {
  books: (params: unknown) => ["books", params] as const,
  book: (id: string) => ["book", id] as const,
  categories: ["categories"] as const,
  locations: ["locations"] as const,
  loans: ["loans"] as const,
};

export function batalkanSemuaBuku() {
  queryClient.invalidateQueries({ queryKey: ["books"] });
  queryClient.invalidateQueries({ queryKey: ["book"] });
  queryClient.invalidateQueries({ queryKey: ["loans"] });
}
