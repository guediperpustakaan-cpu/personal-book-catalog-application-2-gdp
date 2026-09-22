-- ============================================================================
-- BukuRumah — data contoh (seed)
-- Jalankan SETELAH 0001_skema_awal.sql.
-- Ganti UUID pengguna di bawah dengan ID akun Anda dari Auth > Users.
-- ============================================================================

-- 1) Tentukan pengguna pemilik data contoh.
do $$
declare
  v_user uuid;
  v_fiksi uuid;
  v_teknologi uuid;
  v_novel uuid;
  v_sejarah uuid;
  v_bisnis uuid;
  v_agama uuid;
  v_pendidikan uuid;
  v_biografi uuid;
  v_komik uuid;
  v_nonfiksi uuid;
  v_rak_a uuid;
  v_rak_b uuid;
  v_lemari uuid;
  v_tamu uuid;
  v_kardus1 uuid;
  v_kardus2 uuid;
  v_buku_sapiens uuid;
  v_buku_matematika uuid;
  v_buku_laskar uuid;
begin
  -- Ambil pengguna pertama yang terdaftar.
  select id into v_user from auth.users order by created_at limit 1;
  if v_user is null then
    raise notice 'Belum ada pengguna. Daftar akun terlebih dahulu lalu jalankan ulang berkas ini.';
    return;
  end if;

  -- ---------------------------------------------------------------- kategori
  insert into public.categories (user_id, name) values
    (v_user, 'Fiksi'),
    (v_user, 'Nonfiksi'),
    (v_user, 'Teknologi'),
    (v_user, 'Bisnis'),
    (v_user, 'Sejarah'),
    (v_user, 'Agama'),
    (v_user, 'Pendidikan'),
    (v_user, 'Biografi'),
    (v_user, 'Komik'),
    (v_user, 'Novel'),
    (v_user, 'Lainnya')
  on conflict do nothing;

  select id into v_fiksi       from public.categories where user_id = v_user and name = 'Fiksi';
  select id into v_nonfiksi    from public.categories where user_id = v_user and name = 'Nonfiksi';
  select id into v_teknologi   from public.categories where user_id = v_user and name = 'Teknologi';
  select id into v_novel       from public.categories where user_id = v_user and name = 'Novel';
  select id into v_sejarah     from public.categories where user_id = v_user and name = 'Sejarah';
  select id into v_bisnis      from public.categories where user_id = v_user and name = 'Bisnis';
  select id into v_agama       from public.categories where user_id = v_user and name = 'Agama';
  select id into v_pendidikan  from public.categories where user_id = v_user and name = 'Pendidikan';
  select id into v_biografi    from public.categories where user_id = v_user and name = 'Biografi';
  select id into v_komik       from public.categories where user_id = v_user and name = 'Komik';

  -- ------------------------------------------------------------------ lokasi
  insert into public.storage_locations (user_id, name, description) values
    (v_user, 'Rak A', 'Rak kayu ruang kerja'),
    (v_user, 'Rak B', 'Rak ruang tamu'),
    (v_user, 'Lemari kamar', 'Lemari pakaian, rak bawah'),
    (v_user, 'Ruang tamu', 'Meja sudut ruang tamu'),
    (v_user, 'Kardus 1', 'Kardus di gudang'),
    (v_user, 'Kardus 2', 'Kardus di gudang')
  on conflict do nothing;

  select id into v_rak_a    from public.storage_locations where user_id = v_user and name = 'Rak A';
  select id into v_rak_b    from public.storage_locations where user_id = v_user and name = 'Rak B';
  select id into v_lemari   from public.storage_locations where user_id = v_user and name = 'Lemari kamar';
  select id into v_tamu     from public.storage_locations where user_id = v_user and name = 'Ruang tamu';
  select id into v_kardus1  from public.storage_locations where user_id = v_user and name = 'Kardus 1';
  select id into v_kardus2  from public.storage_locations where user_id = v_user and name = 'Kardus 2';

  -- -------------------------------------------------------------------- buku
  -- Tiap baris dipasangkan kunci unik (user_id, isbn) lewat ON CONFLICT,
  -- sehingga menjalankan berkas ini berulang kali tetap aman.
  insert into public.books (
    user_id, title, author, isbn, publisher, publication_year, edition, language,
    category_id, description, page_count, condition, storage_location_id,
    reading_status, ownership_status, rating, notes, acquired_date
  ) values
  (v_user, 'Bumi Manusia', 'Pramoedya Ananta Toer', '9789799731234', 'Hasta Mitra', 1980,
    'Cetakan ke-40', 'Indonesia', v_novel,
    'Kisah Minke, pemuda pribumi terpelajar di akhir abad ke-19.', 535, 'baik', v_rak_a,
    'sudah_dibaca', 'dimiliki', 5, 'Sampul sedikit pudar.', '2019-06-14'),

  (v_user, 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin',
    '9780132350884', 'Prentice Hall', 2008, 'Edisi pertama', 'Inggris', v_teknologi,
    'Panduan menulis kode yang mudah dibaca dan dirawat.', 464, 'sangat_baik', v_rak_a,
    'sedang_dibaca', 'dimiliki', 4, 'Banyak catatan di margin.', '2022-02-08'),

  (v_user, 'Sapiens: Riwayat Singkat Umat Manusia', 'Yuval Noah Harari', '9786024246945',
    'Kepustakaan Populer Gramedia', 2016, 'Cetakan ke-12', 'Indonesia', v_sejarah,
    'Perjalanan panjang Homo sapiens dari revolusi kognitif hingga era kapitalisme global.',
    528, 'baik', v_tamu, 'sudah_dibaca', 'dipinjamkan', 4.5, null, '2021-11-02'),

  (v_user, 'Atomic Habits', 'James Clear', '9786020631873', 'Gramedia Pustaka Utama', 2019,
    'Cetakan ke-5', 'Indonesia', v_bisnis,
    'Membangun kebiasaan baik lewat perubahan kecil.', 340, 'baru', v_lemari,
    'sedang_dibaca', 'dimiliki', 4, 'Hadiah ulang tahun.', '2025-01-20'),

  (v_user, 'Laskar Pelangi', 'Andrea Hirata', '9789793062792', 'Bentang Pustaka', 2005,
    'Cetakan ke-25', 'Indonesia', v_novel,
    'Kisah sepuluh anak Belitung yang berjuang menempuh pendidikan.', 529, 'cukup', v_rak_b,
    'sudah_dibaca', 'dimiliki', 4.5, 'Beberapa halaman terlipat.', '2018-08-17'),

  (v_user, 'Sejarah Indonesia Modern', 'M.C. Ricklefs', '9789794338651', 'Serambi', 2008,
    'Edisi ketiga', 'Indonesia', v_sejarah,
    'Rangkuman perjalanan politik Nusantara sejak 1300.', 712, 'sangat_baik', v_rak_b,
    'belum_dibaca', 'dimiliki', 4, null, '2023-04-09'),

  (v_user, 'Tadabbur Al-Qur''an Jilid 1', 'M. Quraish Shihab', '9789793702612', 'Lentera Hati',
    2013, 'Cetakan ke-7', 'Indonesia', v_agama,
    'Tafsir tematis yang memudahkan pemahaman Al-Qur''an.', 386, 'baik', v_lemari,
    'sedang_dibaca', 'dimiliki', 5, 'Dipakai kajian mingguan.', '2020-09-30'),

  (v_user, 'The Pragmatic Programmer', 'David Thomas, Andrew Hunt', '9780135957059',
    'Addison-Wesley', 2019, 'Edisi kedua', 'Inggris', v_teknologi,
    'Prinsip praktis pengembangan perangkat lunak.', 352, 'baru', v_rak_a,
    'belum_dibaca', 'dimiliki', 5, null, '2025-06-01'),

  (v_user, 'Detektif Conan Vol. 95', 'Gosho Aoyama', '9784088812345', 'Shogakukan', 2018,
    null, 'Jepang', v_komik, 'Kasus baru bagi Shinichi Kudo.', 192, 'sangat_baik', v_kardus1,
    'sudah_dibaca', 'dimiliki', 3.5, 'Dibeli di toko buku bekas.', '2024-07-11'),

  (v_user, 'Educated: Kisah Perjuangan Menempuh Pendidikan', 'Tara Westover', '9786024248208',
    'Kepustakaan Populer Gramedia', 2019, 'Cetakan ke-3', 'Indonesia', v_biografi,
    'Memoar perempuan yang tumbuh tanpa sekolah.', 424, 'baik', v_tamu,
    'belum_dibaca', 'dimiliki', 4.5, null, '2024-12-05'),

  (v_user, 'Matematika Dasar untuk SMA Kelas X', 'Tim Kemdikbud', '9786022827654',
    'Pusat Kurikulum dan Perbukuan', 2021, 'Edisi revisi', 'Indonesia', v_pendidikan,
    'Buku pelajaran matematika wajib kelas sepuluh.', 296, 'rusak', v_kardus2,
    'tidak_ingin_dibaca', 'ingin_dijual', 3, 'Sampul belakang lepas.', '2021-07-15'),

  (v_user, 'Kisah Para Pemikir Indonesia', 'Goenawan Mohamad', '9789794338729', 'Kompas', 2010,
    'Cetakan ke-2', 'Indonesia', v_nonfiksi,
    'Esai tentang gagasan dan tokoh kebudayaan Indonesia.', 268, 'cukup', v_kardus2,
    'belum_dibaca', 'dimiliki', 4, 'Ada noda kopi di halaman 40.', '2023-10-21')
  on conflict (user_id, isbn) do nothing;

  -- -------------------------------------------------------------- peminjaman
  select id into v_buku_sapiens from public.books
    where user_id = v_user and title like 'Sapiens%';
  select id into v_buku_matematika from public.books
    where user_id = v_user and title like 'Matematika Dasar%';
  select id into v_buku_laskar from public.books
    where user_id = v_user and title = 'Laskar Pelangi';

  insert into public.loans (user_id, book_id, borrower_name, borrower_contact, borrowed_at,
    due_at, returned_at, status, notes)
  values
  (v_user, v_buku_sapiens, 'Rani Kusuma', '0812-3456-7890', current_date - 20,
    current_date - 6, null, 'dipinjam', 'Untuk tugas kuliah anak sepupu.'),
  (v_user, v_buku_matematika, 'Pak Darto', null, current_date - 4,
    current_date + 10, null, 'dipinjam', 'Dipakai anaknya.'),
  (v_user, v_buku_laskar, 'Dimas Prasetyo', '0857-1122-3344', current_date - 70,
    current_date - 50, now() - interval '45 days', 'dikembalikan', 'Dikembalikan lengkap.')
  on conflict do nothing;

  -- ------------------------------------------------------ riwayat baca contoh
  -- Gunakan ON CONFLICT agar seed bisa dijalankan berulang tanpa error
  -- (reading_logs tidak memiliki constraint unik; saring dulu baris yang sudah ada).
  insert into public.reading_logs (user_id, book_id, status, finished_at)
  select b.user_id, b.id, b.reading_status, b.updated_at
  from public.books b
  where b.user_id = v_user
    and b.reading_status = 'sudah_dibaca'
    and not exists (
      select 1 from public.reading_logs r
      where r.user_id = b.user_id and r.book_id = b.id
    );

  raise notice 'Data contoh berhasil dibuat untuk pengguna %.', v_user;
end $$;
