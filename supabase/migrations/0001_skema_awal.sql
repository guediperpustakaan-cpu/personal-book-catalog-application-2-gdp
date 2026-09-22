-- ============================================================================
-- BukuRumah — skema awal untuk Supabase PostgreSQL
-- Jalankan berkas ini di SQL Editor Supabase atau: supabase db push
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tabel: categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_name_panjang check (char_length(trim(name)) between 1 and 60)
);

create unique index if not exists categories_user_name_unik
  on public.categories (user_id, lower(trim(name)));

-- ----------------------------------------------------------------------------
-- Tabel: storage_locations
-- ----------------------------------------------------------------------------
create table if not exists public.storage_locations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint storage_locations_name_panjang check (char_length(trim(name)) between 1 and 60)
);

create unique index if not exists storage_locations_user_name_unik
  on public.storage_locations (user_id, lower(trim(name)));

-- ----------------------------------------------------------------------------
-- Tabel: books
-- ----------------------------------------------------------------------------
create table if not exists public.books (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  title               text not null,
  author              text,
  isbn                text,
  publisher           text,
  publication_year    integer,
  edition             text,
  language            text,
  category_id         uuid references public.categories (id) on delete set null,
  description         text,
  page_count          integer,
  cover_image_url     text,
  cover_thumb_url     text,
  condition           text
                      check (condition in ('baru','sangat_baik','baik','cukup','rusak')),
  storage_location_id uuid references public.storage_locations (id) on delete set null,
  reading_status      text
                      check (reading_status in
                        ('belum_dibaca','sedang_dibaca','sudah_dibaca','tidak_ingin_dibaca')),
  ownership_status    text
                      check (ownership_status in
                        ('dimiliki','dipinjamkan','hilang','ingin_dijual','rusak')),
  rating              numeric(2,1) check (rating >= 0 and rating <= 5),
  notes               text,
  acquired_date       date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint books_title_panjang check (char_length(trim(title)) between 1 and 300),
  constraint books_tahun_wajar check (publication_year is null or publication_year between 1000 and 3000),
  constraint books_halaman_wajar check (page_count is null or page_count between 1 and 20000)
);

create index if not exists books_user_id_idx          on public.books (user_id);
create index if not exists books_user_created_idx     on public.books (user_id, created_at desc);
create index if not exists books_title_idx            on public.books using gin (to_tsvector('simple', title));
create index if not exists books_user_title_idx       on public.books (user_id, title);
create index if not exists books_user_author_idx      on public.books (user_id, author);
create index if not exists books_isbn_idx             on public.books (user_id, isbn);
create index if not exists books_category_idx         on public.books (category_id);
create index if not exists books_location_idx         on public.books (storage_location_id);
create index if not exists books_reading_status_idx   on public.books (user_id, reading_status);
create index if not exists books_ownership_status_idx on public.books (user_id, ownership_status);
create index if not exists books_condition_idx        on public.books (user_id, condition);
create index if not exists books_rating_idx           on public.books (user_id, rating desc);
create index if not exists books_year_idx             on public.books (user_id, publication_year);

-- Satu buku dengan ISBN tertentu hanya boleh ada sekali per pengguna.
create unique index if not exists books_user_isbn_unik on public.books (user_id, isbn);

-- ----------------------------------------------------------------------------
-- Tabel: loans (peminjaman)
-- ----------------------------------------------------------------------------
create table if not exists public.loans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  book_id          uuid not null references public.books (id) on delete cascade,
  borrower_name    text not null,
  borrower_contact text,
  borrowed_at      date not null,
  due_at           date not null,
  returned_at      timestamptz,
  status           text not null default 'dipinjam'
                   check (status in ('dipinjam','dikembalikan')),
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint loans_nama_panjang check (char_length(trim(borrower_name)) between 1 and 120),
  constraint loans_tanggal_wajar check (due_at >= borrowed_at)
);

create index if not exists loans_user_idx     on public.loans (user_id);
create index if not exists loans_book_idx     on public.loans (book_id);
create index if not exists loans_status_idx   on public.loans (user_id, status);
create index if not exists loans_due_idx      on public.loans (user_id, due_at);

-- ----------------------------------------------------------------------------
-- Tabel: reading_logs (riwayat perubahan status membaca)
-- ----------------------------------------------------------------------------
create table if not exists public.reading_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  book_id    uuid not null references public.books (id) on delete cascade,
  status     text not null
             check (status in
               ('belum_dibaca','sedang_dibaca','sudah_dibaca','tidak_ingin_dibaca')),
  started_at timestamptz,
  finished_at timestamptz,
  notes      text,
  created_at timestamptz not null default now()
);

create index if not exists reading_logs_user_idx on public.reading_logs (user_id);
create index if not exists reading_logs_book_idx on public.reading_logs (book_id, created_at desc);

-- ----------------------------------------------------------------------------
-- Trigger updated_at otomatis
-- ----------------------------------------------------------------------------
-- Catatan: dua trigger dipasang pada loans — before update (updated_at) dan
-- after insert/update/delete (sinkronisasi status kepemilikan buku di bawah).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists books_updated_at on public.books;
create trigger books_updated_at before update on public.books
  for each row execute function public.set_updated_at();

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists storage_locations_updated_at on public.storage_locations;
create trigger storage_locations_updated_at before update on public.storage_locations
  for each row execute function public.set_updated_at();

drop trigger if exists loans_updated_at on public.loans;
create trigger loans_updated_at before update on public.loans
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Sinkronisasi status kepemilikan buku otomatis
-- ----------------------------------------------------------------------------
-- Saat sebuah peminjaman aktif (status = 'dipinjam'), buku terkait ditandai
-- 'dipinjamkan'. Saat dikembalikan, kembali ke 'dimiliki'. Logika ini disimpan
-- di database agar semua klien (frontend, impor, script) selalu konsisten.
create or replace function public.sinkron_kepemilikan_buku()
returns trigger
language plpgsql
as $$
begin
  -- Peminjaman baru atau perubahan ke status dipinjam
  if (tg_op = 'INSERT' and new.status = 'dipinjam')
     or (tg_op = 'UPDATE' and new.status = 'dipinjam' and old.status <> 'dipinjam') then
    update public.books
      set ownership_status = 'dipinjamkan'
      where id = new.book_id;
  -- Pengembalian
  elsif (tg_op = 'UPDATE' and new.status = 'dikembalikan' and old.status <> 'dikembalikan') then
    update public.books
      set ownership_status = 'dimiliki'
      where id = new.book_id
        and ownership_status = 'dipinjamkan';
  end if;

  -- Hanya kembalikan ke 'dimiliki' bila tidak ada peminjaman aktif lain.
  if tg_op = 'DELETE' and old.status = 'dipinjam' then
    if not exists (
      select 1 from public.loans l
      where l.book_id = old.book_id and l.status = 'dipinjam'
    ) then
      update public.books
        set ownership_status = 'dimiliki'
        where id = old.book_id
          and ownership_status = 'dipinjamkan';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists loans_sinkron_kepemilikan on public.loans;
create trigger loans_sinkron_kepemilikan
  after insert or update or delete on public.loans
  for each row execute function public.sinkron_kepemilikan_buku();

-- ----------------------------------------------------------------------------
-- Row Level Security: setiap pengguna hanya boleh mengelola datanya sendiri
-- ----------------------------------------------------------------------------
alter table public.books             enable row level security;
alter table public.categories        enable row level security;
alter table public.storage_locations enable row level security;
alter table public.loans             enable row level security;
alter table public.reading_logs      enable row level security;

-- books
drop policy if exists "pemilik_bisa_baca_buku" on public.books;
create policy "pemilik_bisa_baca_buku" on public.books
  for select using (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_tambah_buku" on public.books;
create policy "pemilik_bisa_tambah_buku" on public.books
  for insert with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_ubah_buku" on public.books;
create policy "pemilik_bisa_ubah_buku" on public.books
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_hapus_buku" on public.books;
create policy "pemilik_bisa_hapus_buku" on public.books
  for delete using (auth.uid() = user_id);

-- categories
drop policy if exists "pemilik_bisa_baca_kategori" on public.categories;
create policy "pemilik_bisa_baca_kategori" on public.categories
  for select using (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_tambah_kategori" on public.categories;
create policy "pemilik_bisa_tambah_kategori" on public.categories
  for insert with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_ubah_kategori" on public.categories;
create policy "pemilik_bisa_ubah_kategori" on public.categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_hapus_kategori" on public.categories;
create policy "pemilik_bisa_hapus_kategori" on public.categories
  for delete using (auth.uid() = user_id);

-- storage_locations
drop policy if exists "pemilik_bisa_baca_lokasi" on public.storage_locations;
create policy "pemilik_bisa_baca_lokasi" on public.storage_locations
  for select using (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_tambah_lokasi" on public.storage_locations;
create policy "pemilik_bisa_tambah_lokasi" on public.storage_locations
  for insert with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_ubah_lokasi" on public.storage_locations;
create policy "pemilik_bisa_ubah_lokasi" on public.storage_locations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_hapus_lokasi" on public.storage_locations;
create policy "pemilik_bisa_hapus_lokasi" on public.storage_locations
  for delete using (auth.uid() = user_id);

-- loans
drop policy if exists "pemilik_bisa_baca_pinjaman" on public.loans;
create policy "pemilik_bisa_baca_pinjaman" on public.loans
  for select using (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_tambah_pinjaman" on public.loans;
create policy "pemilik_bisa_tambah_pinjaman" on public.loans
  for insert with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_ubah_pinjaman" on public.loans;
create policy "pemilik_bisa_ubah_pinjaman" on public.loans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_hapus_pinjaman" on public.loans;
create policy "pemilik_bisa_hapus_pinjaman" on public.loans
  for delete using (auth.uid() = user_id);

-- reading_logs
drop policy if exists "pemilik_bisa_baca_riwayat" on public.reading_logs;
create policy "pemilik_bisa_baca_riwayat" on public.reading_logs
  for select using (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_tambah_riwayat" on public.reading_logs;
create policy "pemilik_bisa_tambah_riwayat" on public.reading_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "pemilik_bisa_hapus_riwayat" on public.reading_logs;
create policy "pemilik_bisa_hapus_riwayat" on public.reading_logs
  for delete using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Supabase Storage: bucket sampul buku
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

-- Hanya pemilik berkas yang boleh mengunggah/menghapus sampulnya.
drop policy if exists "sampul_bisa_dibaca" on storage.objects;
create policy "sampul_bisa_dibaca" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "sampul_bisa_diunggah" on storage.objects;
create policy "sampul_bisa_diunggah" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "sampul_bisa_diubah" on storage.objects;
create policy "sampul_bisa_diubah" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "sampul_bisa_dihapus" on storage.objects;
create policy "sampul_bisa_dihapus" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'covers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
