# 📚 BukuRumah — Katalog Buku Pribadi

Aplikasi katalog buku pribadi untuk **mencatat, mengelola, mencari, dan memantau koleksi buku yang tersebar di rumah**. Seluruh antarmuka menggunakan bahasa Indonesia dengan format tanggal dan angka Indonesia (mis. “21 September 2026”).

Dibangun dengan React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, Lucide React, dan Supabase (PostgreSQL, Storage, Auth).

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Struktur Folder](#struktur-folder)
3. [Instalasi](#instalasi)
4. [Menjalankan di Lokal](#menjalankan-di-lokal)
5. [Menghubungkan ke Supabase](#menghubungkan-ke-supabase)
6. [Menjalankan Migration Database](#menjalankan-migration-database)
7. [Build Production](#build-production)
8. [Data Contoh untuk Pengujian](#data-contoh-untuk-pengujian)
9. [Penjelasan Bagian Penting](#penjelasan-bagian-penting)
10. [Skema Database & Keamanan](#skema-database--keamanan)

---

## Fitur Utama

| Halaman | Rute | Fungsi |
| --- | --- | --- |
| Dashboard | `/` | Kartu statistik, buku baru, terakhir dibaca, ringkasan per kategori & lokasi, tombol cepat **Tambah Buku** dan **Scan ISBN** |
| Koleksi Buku | `/koleksi` | Grid kartu / tabel, pencarian (judul, penulis, ISBN, penerbit, catatan), filter kategori/lokasi/kondisi/status baca/kepemilikan, pengurutan, pagination, URL query parameter |
| Tambah Buku | `/buku/tambah` | Formulir lengkap + validasi, pratinjau & kompresi foto sampul, drag & drop, tombol **Simpan Buku**, **Simpan dan Tambah Lagi**, **Batal** |
| Detail Buku | `/buku/:id` | Informasi lengkap, aksi ubah/hapus, tandai status baca, tandai dipinjamkan, bagikan/salin info buku |
| Ubah Buku | `/buku/:id/edit` | Formulir yang sama, terisi data lama |
| Kategori | `/kategori` | Tambah, ubah nama, hapus (jika tidak dipakai), jumlah buku, buka daftar buku per kategori |
| Lokasi Penyimpanan | `/lokasi` | Tambah, ubah, hapus (jika tidak dipakai), jumlah buku per lokasi |
| Peminjaman | `/peminjaman` | Catat peminjaman, tandai dikembalikan, perpanjang jatuh tempo, riwayat, penanda terlambat |
| Statistik | `/statistik` | Total koleksi, status baca, komposisi per kategori/lokasi/kondisi/tahun, rata-rata rating, grafik perkembangan |
| Pengaturan | `/pengaturan` | Profil, tema terang/gelap, ukuran tampilan, ekspor CSV, impor CSV, cadangan JSON, pengelolaan kategori & lokasi |
| Autentikasi | `/login`, `/register`, `/reset-password` | Hanya aktif bila Supabase dikonfigurasi |

**Fitur lain**

- Scan ISBN via kamera (`BarcodeDetector API`) dengan **fallback input manual** bila perangkat tidak mendukung.
- Pengambilan data buku otomatis dari **Google Books** dan **OpenLibrary**; jika gagal, formulir manual tetap terbuka.
- Impor CSV dengan template, pratinjau, daftar baris bermasalah, pengabaian duplikat ISBN, dan ringkasan hasil.
- Mode **penyimpanan lokal** otomatis saat variabel Supabase belum diisi — aplikasi tetap berjalan penuh tanpa konfigurasi.

---

## Struktur Folder

```
.
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example              # contoh variabel lingkungan
├── supabase/
│   ├── migrations/
│   │   └── 0001_skema_awal.sql   # tabel, index, trigger, RLS, bucket storage
│   └── seed.sql                   # data contoh untuk pengujian
└── src/
    ├── main.tsx
    ├── App.tsx                # susunan penyedia (provider) aplikasi
    ├── index.css              # Tailwind CSS v4 + tema gelap + utilitas
    ├── vite-env.d.ts
    ├── components/
    │   ├── layout/            # Sidebar, MobileNavigation, Header
    │   ├── ui/                # Button, Input, Card, Modal, ConfirmDialog,
    │   │                      # Toast, LoadingSkeleton, EmptyState, StatusBadge,
    │   │                      # RatingInput, Pagination, StatisticsChart
    │   ├── BookCard.tsx       # kartu buku (grid)
    │   ├── BookTable.tsx      # tabel buku
    │   ├── BookCover.tsx      # sampul + pengganti sampul berwarna
    │   ├── BookForm.tsx       # formulir tambah/ubah buku
    │   ├── SearchBar.tsx      # pencarian dengan debounce
    │   ├── FilterPanel.tsx    # filter & pengurutan
    │   ├── CategorySelect.tsx # pilih + tambah kategori
    │   ├── LocationSelect.tsx # pilih + tambah lokasi
    │   ├── ImageUploader.tsx  # unggah + pratinjau + kompresi sampul
    │   ├── BarcodeScanner.tsx # pemindai ISBN via kamera
    │   ├── CsvImport.tsx      # impor CSV dengan pratinjau
    │   └── DashboardCard.tsx  # kartu statistik dashboard
    ├── layouts/AppLayout.tsx
    ├── pages/                 # Dashboard, Books, BookAdd, BookDetail, BookEdit,
    │                          # Categories, Locations, Loans, Statistics, Settings, Auth
    ├── routes/                # AppRoutes (lazy loading) + daftar menu navigasi
    ├── hooks/                 # useLibrary (React Query), useStats, useDebounce,
    │                          # useTheme, Toast & Auth lewat context
    ├── context/AuthContext.tsx
    ├── lib/                   # constants, format (tanggal/angka Indonesia), queryClient
    ├── services/              # api (fasade), localBackend, supabaseBackend,
    │                          # storage, isbnLookup, types (kontrak data)
    ├── integrations/supabase/ # konfigurasi klien Supabase
    ├── types/                 # tipe data domain
    ├── utils/                 # cn, csv, image, validation, error, id
    └── data/seed.ts           # 12 buku contoh untuk mode lokal
```

---

## Instalasi

Prasyarat: **Node.js 18 atau lebih baru** dan npm.

```bash
# 1. Duplikasi/salin proyek lalu masuk ke foldernya
cd bukurumah

# 2. Pasang seluruh dependensi
npm install
```

Dependensi utama yang terpasang:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2",
    "@tanstack/react-query": "^5",
    "lucide-react": "^0.4xx",
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7"
  }
}
```

> Catatan: `clsx` dan `tailwind-merge` juga dipakai untuk penggabungan kelas Tailwind.

---

## Menjalankan di Lokal

```bash
npm run dev
```

Buka <http://localhost:5173>. Tanpa berkas `.env`, aplikasi otomatis berjalan dalam **mode penyimpanan lokal** (data disimpan di `localStorage` peramban) dan sudah terisi **12 buku contoh** sehingga seluruh fitur dapat langsung diuji.

Untuk menghentikan: tekan `Ctrl + C`.

---

## Menghubungkan ke Supabase

1. Buat proyek baru di <https://supabase.com> (pilih wilayah terdekat, mis. Singapore).
2. Buka **Project Settings → API** dan salin dua nilai:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
3. Buat berkas `.env` di akar proyek:

   ```env
   VITE_SUPABASE_URL=https://abcdefghij.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

4. Restart server pengembangan (`npm run dev`).

**Penting**

- Gunakan **anon key**, bukan `service_role` key. Service role key tidak boleh ada di frontend.
- Simpan `.env` di `.gitignore` (jangan pernah di-commit).
- RLS pada migration sudah memastikan setiap pengguna hanya dapat membaca dan mengubah datanya sendiri.
- Daftarkan `http://localhost:5173` pada **Authentication → URL Configuration → Redirect URLs** bila ingin memakai masuk lewat email.

### Bucket penyimpanan sampul

Migration otomatis membuat bucket publik bernama `covers` beserta kebijakan yang membatasi unggah/ubah/hapus hanya pada folder milik pengguna (`covers/<user_id>/...`). Gambar dibaca publik agar sampul dapat ditampilkan.

---

## Menjalankan Migration Database

**Cara termudah (SQL Editor):**

1. Buka Supabase Dashboard → **SQL Editor → New query**.
2. Salin seluruh isi `supabase/migrations/0001_skema_awal.sql`, tempel, lalu klik **Run**.
3. (Opsional) Daftar akun di **Authentication → Users**, lalu jalankan `supabase/seed.sql` dengan cara yang sama untuk mengisi data contoh ke akun Anda.

**Cara Supabase CLI:**

```bash
# login sekali
npx supabase login

# hubungkan proyek (ganti referensi proyek Anda)
npx supabase link --project-ref abcdefghij

# terapkan migration
npx supabase db push

# atau jalankan data contoh
npx supabase db execute --file supabase/seed.sql
```

Migration membuat:

- Tabel `books`, `categories`, `storage_locations`, `loans`, `reading_logs`
- Foreign key dengan `on delete cascade` / `set null`
- Index pada kolom pencarian, filter, dan relasi
- Trigger `updated_at` otomatis
- Kebijakan **Row Level Security** untuk seluruh tabel
- Bucket Storage `covers` + kebijakannya

---

## Build Production

```bash
# hasil di folder dist/
npm run build

# uji hasil build secara lokal
npm run preview
```

Untuk penerapan:

- **Netlify / Vercel / Cloudflare Pages**: arahkan build command `npm run build` dan publish directory `dist`.
- Pastikan variabel `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` diisi pada pengaturan environment host Anda.
- Router memakai mode hash (`#/koleksi`) sehingga tidak memerlukan konfigurasi rewrite khusus pada host statis.

---

## Data Contoh untuk Pengujian

Mode lokal otomatis memuat 12 buku dari `src/data/seed.ts`:

| Judul | Kategori | Lokasi | Status baca | Kepemilikan | Kondisi | Rating |
| --- | --- | --- | --- | --- | --- | --- |
| Bumi Manusia | Novel | Rak A | Sudah dibaca | Dimiliki | Baik | 5 |
| Clean Code | Teknologi | Rak A | Sedang dibaca | Dimiliki | Sangat baik | 4 |
| Sapiens | Sejarah | Ruang tamu | Sudah dibaca | Dipinjamkan | Baik | 4,5 |
| Atomic Habits | Bisnis | Lemari kamar | Sedang dibaca | Dimiliki | Baru | 4 |
| Laskar Pelangi | Novel | Rak B | Sudah dibaca | Dimiliki | Cukup | 4,5 |
| Sejarah Indonesia Modern | Sejarah | Rak B | Belum dibaca | Dimiliki | Sangat baik | 4 |
| Tadabbur Al-Qur'an Jilid 1 | Agama | Lemari kamar | Sedang dibaca | Dimiliki | Baik | 5 |
| The Pragmatic Programmer | Teknologi | Rak A | Belum dibaca | Dimiliki | Baru | 5 |
| Detektif Conan Vol. 95 | Komik | Kardus 1 | Sudah dibaca | Dimiliki | Sangat baik | 3,5 |
| Educated | Biografi | Ruang tamu | Belum dibaca | Dimiliki | Baik | 4,5 |
| Matematika Dasar SMA X | Pendidikan | Kardus 2 | Tidak ingin dibaca | Ingin dijual | Rusak | 3 |
| Kisah Para Pemikir Indonesia | Nonfiksi | Kardus 2 | Belum dibaca | Dimiliki | Cukup | 4 |

Data peminjaman contoh: 1 sedang dipinjam, 1 **terlambat**, 1 sudah dikembalikan.

Untuk mode Supabase, gunakan `supabase/seed.sql` (ganti otomatis memakai pengguna pertama).

### Format CSV untuk impor

Unduh template dari **Pengaturan → Impor data buku dari CSV → Unduh template**. Kolom yang didukung:

```
judul,penulis,isbn,penerbit,tahun,edisi,bahasa,kategori,deskripsi,jumlah_halaman,
kondisi,lokasi,status_baca,kepemilikan,rating,catatan,tanggal_diperoleh
```

- Hanya `judul` yang wajib.
- Nilai `kondisi`, `status_baca`, `kepemilikan` ditulis dalam bahasa Indonesia (mis. “Sudah dibaca”).
- Nama `kategori` dan `lokasi` harus sama persis dengan yang tersimpan agar otomatis terhubung; jika tidak ditemukan, nilainya dikosongkan (baris tetap diimpor).
- Baris dengan ISBN yang sudah ada akan dilewati untuk menghindari duplikasi.
- Baris bermasalah tidak menggagalkan baris lain; ringkasan jumlah berhasil/gagal ditampilkan setelah impor.

---

## Penjelasan Bagian Penting

### 1. Lapisan data yang dapat ditukar — `src/services/`

`src/services/types.ts` mendefinisikan **kontrak** `DataService`. Ada dua implementasi:

- `localBackend.ts` — memakai `localStorage` + data contoh. Dipakai bila Supabase belum dikonfigurasi.
- `supabaseBackend.ts` — memakai Supabase PostgreSQL (pemetaan snake_case ⇄ camelCase, filter/urut/pagination di sisi server), Storage untuk sampul, dan `reading_logs` untuk riwayat baca.

`src/services/api.ts` adalah **fasade** tunggal: UI hanya berbicara dengan `dataService`, sehingga menambah backend lain (mis. REST sendiri) cukup membuat satu berkas baru tanpa mengubah komponen.

### 2. Pengambilan data & caching — `src/hooks/useLibrary.ts`

Semua akses data dibungkus **TanStack Query**:

- `useBuku(params)` — daftar buku dengan pagination (kunci kueri memuat seluruh parameter filter).
- `useDetailBuku`, `useKategori`, `useLokasi`, `usePeminjaman` — data acuan yang di-cache.
- Mutasi (`useSimpanBuku`, `useHapusBuku`, `useUbahStatusBaca`, dll.) otomatis membatalkan cache terkait lewat `batalkanSemuaBuku()`.
- `placeholderData` dipertahankan agar perpindahan halaman tidak menyebabkan kedipan layout.

### 3. Debounce & URL query — `src/pages/BooksPage.tsx` + `SearchBar.tsx`

- `useDebounce(nilai, 400)` menunda permintaan sampai pengguna berhenti mengetik.
- Kondisi pencarian, filter, urutan, jumlah per halaman, dan nomor halaman **disimpan pada URL** (`/koleksi?q=sapiens&kategori=...&urut=rating&arah=desc&halaman=2`), sehingga tautan dapat dibagikan dan tombol kembali peramban tetap berfungsi.

### 4. Kompresi gambar — `src/utils/image.ts` + `services/storage.ts`

Foto sampul di-*resize* dan dikompresi di perangkat pengguna memakai `canvas` sebelum diunggah: versi utama maksimal 900 px dan **thumbnail 260 px** untuk daftar. Foto resolusi besar hanya dipakai pada halaman detail. Batas berkas 5 MB. Mode lokal menyimpan hasil kompresi sebagai data URL.

### 5. Pemindaian ISBN — `src/components/BarcodeScanner.tsx`

Menggunakan `BarcodeDetector` (tersedia di Chrome/Android). Bila API tidak tersedia atau izin kamera ditolak, komponen menampilkan pesan jelas dan menyediakan **kolom input manual** sehingga alur tidak pernah gagal. Hasil pindaian diteruskan ke `services/isbnLookup.ts` (Google Books → OpenLibrary) untuk mengisi formulir otomatis; pengguna tetap dapat mengubah semuanya sebelum menyimpan.

### 6. Impor/ekspor CSV — `src/utils/csv.ts` + `components/CsvImport.tsx`

Parser CSV sendiri yang mendukung tanda kutip serta pemisah koma/titik koma. Impor menampilkan pratinjau, daftar baris bermasalah, jumlah duplikat ISBN yang dilewati, dan ringkasan akhir. Ekspor menghasilkan berkas CSV dengan header berbahasa Indonesia dan BOM UTF-8 agar terbuka benar di Microsoft Excel.

### 7. Bentuk & validasi — `src/utils/validation.ts` + `components/BookForm.tsx`

Validasi berjalan di klien dengan pesan bahasa Indonesia (judul wajib, ISBN 10/13 digit, tahun 1000–sekarang+2, halaman 1–20.000, rating 0–5). Bila terjadi error, **input pengguna tidak dihapus**; kolom bermasalah diberi `aria-invalid`, pesan error, dan fokus otomatis. Database menerapkan batasan serupa (`check` constraint) sebagai lapisan kedua.

### 8. Antarmuka & aksesibilitas — `src/components/ui/`

- Semua input memiliki label, tombol memiliki teks atau `aria-label`.
- Status ditandai **warna + ikon/teks** (mis. “● Sudah dibaca”), bukan warna saja.
- Dialog dapat ditutup dengan `Escape`, latar belakang dikunci saat modal terbuka.
- Fokus keyboard terlihat (gaya `:focus-visible` global) dan tersedia tautan “Langsung ke konten utama”.
- Tabel panjang memiliki pembungkus scroll horizontal, bukan terpotong.
- Tema terang/gelap dan ukuran tampilan (rapat/normal/lapang) tersimpan di `localStorage`.

### 9. Performa

- **Lazy loading** seluruh halaman (`React.lazy` + `Suspense`) di `src/routes/AppRoutes.tsx`.
- Pagination + `placeholderData` untuk mengurangi permintaan berulang.
- Debounce pencarian, caching TanStack Query, `staleTime` 30 detik.
- Thumbnail di daftar, foto besar hanya di detail, `loading="lazy"` + `decoding="async"`.
- `BookCard` dibungkus `React.memo` karena daftar dapat panjang.
- Skeleton loading (`LoadingSkeleton`) dan penanda `aria-busy` untuk menghindari kedipan.

### 10. Status dan pilihan nilai

- **Status membaca**: Belum dibaca, Sedang dibaca, Sudah dibaca, Tidak ingin dibaca
- **Status kepemilikan**: Dimiliki, Dipinjamkan, Hilang, Ingin dijual, Rusak
- **Kondisi buku**: Baru, Sangat baik, Baik, Cukup, Rusak

Daftar nilai berbahasa Indonesia berada di `src/lib/constants.ts`, sedangkan nilai internal disimpan dalam bahasa Inggris di database agar konsisten.

---

## Skema Database & Keamanan

Ringkasan relasi:

```
auth.users ─┬─< categories ──────< books >─ storage_locations
            ├─< storage_locations      │
            ├─< loans ─────────────────┘
            └─< reading_logs ──────────┘
```

Keamanan yang diterapkan:

1. **Row Level Security aktif di semua tabel.** Setiap kebijakan membandingkan `auth.uid() = user_id`, sehingga pengguna hanya dapat melihat, menambah, mengubah, dan menghapus datanya sendiri.
2. **Tidak ada service role key di frontend.** Hanya anon key melalui `VITE_SUPABASE_ANON_KEY`.
3. **Validasi dua lapis**: klien (`utils/validation.ts`) dan database (`check` constraint pada `condition`, `reading_status`, `ownership_status`, `rating`, panjang teks, dan kewajaran tahun/halaman/tanggal).
4. **Storage dibatasi**: unggah/ubah/hapus objek di bucket `covers` hanya boleh pada folder `covers/<user_id>/…`.
5. **Kunci asing** dengan `on delete cascade` (buku terhapus → pinjaman & riwayat ikut terhapus) dan `set null` (kategori/lokasi dihapus → buku tetap ada tanpa kategori/lokasi).
6. **Index** pada semua kolom yang sering dipakai untuk pencarian (`title`, `isbn`), filter (`reading_status`, `ownership_status`, `condition`), pengurutan (`created_at`, `rating`, `publication_year`), dan relasi (`category_id`, `storage_location_id`, `book_id`).

---

## Lisensi

Proyek contoh untuk penggunaan pribadi. Bebas dikembangkan lebih lanjut.
