import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dataService } from "@/services/api";
import { batalkanSemuaBuku, KUNCI_QUERY } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import type {
  Book,
  BookInput,
  BookListParams,
  BookSortField,
  LoanInput,
  ReadingLog,
  ReadingStatus,
  SortDirection,
} from "@/types";

export interface ParamBuku extends BookListParams {
  search: string;
  categoryId: string;
  locationId: string;
  condition: string;
  readingStatus: string;
  ownershipStatus: string;
  sort: BookSortField;
  direction: SortDirection;
  page: number;
  pageSize: number;
}

export function useBuku(params: ParamBuku, aktif = true) {
  const { userId } = useAuth();
  return useQuery({
    queryKey: KUNCI_QUERY.books({ ...params, userId }),
    queryFn: () => dataService.listBooks(params),
    enabled: aktif,
  });
}

export function useDetailBuku(id?: string) {
  return useQuery({
    queryKey: KUNCI_QUERY.book(id ?? ""),
    queryFn: () => dataService.getBook(id as string),
    enabled: Boolean(id),
  });
}

export function useKategori() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: KUNCI_QUERY.categories,
    queryFn: () => dataService.listCategories(),
    enabled: userId !== undefined,
  });
}

export function useLokasi() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: KUNCI_QUERY.locations,
    queryFn: () => dataService.listLocations(),
    enabled: userId !== undefined,
  });
}

export function usePeminjaman() {
  return useQuery({
    queryKey: KUNCI_QUERY.loans,
    queryFn: () => dataService.listLoans(),
  });
}

/* ------------------------------- mutasi buku ------------------------------ */

function gunakanMutasiBuku<TInput, THasil>(
  fn: (input: TInput) => Promise<THasil>,
  batalSemua = true
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (batalSemua) batalkanSemuaBuku();
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.categories });
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.locations });
    },
  });
}

export function useSimpanBuku() {
  const { userId } = useAuth();
  return gunakanMutasiBuku<BookInput, Book>((input) =>
    dataService.createBook(input, userId)
  );
}

export function useUbahBuku() {
  return gunakanMutasiBuku<{ id: string; input: Partial<BookInput> }, Book>(
    ({ id, input }) => dataService.updateBook(id, input)
  );
}

export function useHapusBuku() {
  return gunakanMutasiBuku<string, void>((id) => dataService.deleteBook(id));
}

export function useImporBuku() {
  const { userId } = useAuth();
  return gunakanMutasiBuku<BookInput[], Book[]>((inputs) =>
    dataService.createBooks(inputs, userId)
  );
}

/** Ubah status baca + catat ke reading_logs agar riwayat tersimpan. */
export function useUbahStatusBaca() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      buku,
      status,
    }: {
      buku: Pick<Book, "id" | "readingStatus">;
      status: ReadingStatus;
    }) => {
      const sekarang = new Date().toISOString();
      const hasil = await dataService.updateBook(buku.id, { readingStatus: status });
      const log: Omit<ReadingLog, "id" | "createdAt"> = {
        userId,
        bookId: buku.id,
        status,
        startedAt: status === "sedang_dibaca" ? sekarang : null,
        finishedAt: status === "sudah_dibaca" ? sekarang : null,
        notes: null,
      };
      await dataService.addReadingLog(log, userId).catch(() => null);
      return hasil;
    },
    onSuccess: (_data, variabel) => {
      batalkanSemuaBuku();
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.book(variabel.buku.id) });
    },
  });
}

/* --------------------------- mutasi kategori/lokasi ----------------------- */

export function useSimpanKategori() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nama: string) => dataService.createCategory({ name: nama }, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.categories }),
  });
}

export function useUbahKategori() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nama }: { id: string; nama: string }) =>
      dataService.updateCategory(id, { name: nama }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.categories });
      batalkanSemuaBuku();
    },
  });
}

export function useHapusKategori() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.categories });
      batalkanSemuaBuku();
    },
  });
}

export function useSimpanLokasi() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      dataService.createLocation(input, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.locations }),
  });
}

export function useUbahLokasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { name: string; description?: string } }) =>
      dataService.updateLocation(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.locations });
      batalkanSemuaBuku();
    },
  });
}

export function useHapusLokasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.locations });
      batalkanSemuaBuku();
    },
  });
}

/* ------------------------------ mutasi pinjaman --------------------------- */

export function useSimpanPinjaman() {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoanInput) => dataService.createLoan(input, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.loans });
      batalkanSemuaBuku();
    },
  });
}

export function useUbahPinjaman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<LoanInput> }) =>
      dataService.updateLoan(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.loans });
      batalkanSemuaBuku();
    },
  });
}

export function useHapusPinjaman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dataService.deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KUNCI_QUERY.loans });
      batalkanSemuaBuku();
    },
  });
}
