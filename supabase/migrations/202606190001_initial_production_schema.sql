create extension if not exists "pgcrypto";

create type public.kategori_kebutuhan as enum (
  'slow_learner', 'disleksia', 'adhd', 'autisme', 'tunanetra',
  'tunarungu', 'hambatan_intelektual', 'hambatan_motorik',
  'hambatan_komunikasi', 'lainnya', 'belum_teridentifikasi'
);

create type public.status_tujuan as enum (
  'belum_dimulai', 'berkembang', 'hampir_tercapai', 'tercapai', 'perlu_revisi'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  sekolah text,
  created_at timestamptz not null default now()
);

create table public.kelas (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references public.profiles(id) on delete cascade,
  nama text not null,
  jenjang text not null check (jenjang in ('SD', 'SMP', 'SMA', 'Lainnya')),
  tahun_ajaran text not null,
  created_at timestamptz not null default now(),
  unique (guru_id, nama, tahun_ajaran)
);

create table public.siswa (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references public.profiles(id) on delete cascade,
  kelas_id uuid not null references public.kelas(id) on delete restrict,
  nama text not null,
  kategori public.kategori_kebutuhan not null default 'belum_teridentifikasi',
  deskripsi_kebutuhan text,
  sumber_identifikasi text not null default 'guru' check (sumber_identifikasi in ('guru', 'ai_dikonfirmasi', 'belum_dikonfirmasi')),
  kekuatan_minat text,
  created_at timestamptz not null default now()
);

create table public.asesmen_awal (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null unique references public.siswa(id) on delete cascade,
  fungsi_belajar text not null,
  komunikasi text not null,
  sosial_emosi text not null,
  sensorik_motorik text not null,
  catatan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ppi (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  periode_mulai date not null,
  periode_selesai date not null,
  tujuan_jangka_panjang text,
  strategi jsonb not null default '[]'::jsonb,
  tim jsonb not null default '[]'::jsonb,
  status text not null default 'aktif' check (status in ('draft', 'aktif', 'selesai')),
  created_at timestamptz not null default now()
);

create table public.tujuan_ppi (
  id uuid primary key default gen_random_uuid(),
  ppi_id uuid not null references public.ppi(id) on delete cascade,
  area text not null,
  tujuan text not null,
  indikator text not null,
  target integer not null check (target between 0 and 100),
  capaian integer not null default 0 check (capaian between 0 and 100),
  status public.status_tujuan not null default 'belum_dimulai',
  created_at timestamptz not null default now()
);

create table public.observasi (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  guru_id uuid not null references public.profiles(id) on delete cascade,
  tujuan_ppi_id uuid references public.tujuan_ppi(id) on delete set null,
  minggu_ke integer not null,
  tanggal date not null default current_date,
  jawaban jsonb not null,
  catatan text,
  created_at timestamptz not null default now()
);

create table public.analisis_ai (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  periode text not null,
  hasil jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nama, sekolah)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nama', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'sekolah'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.kelas enable row level security;
alter table public.siswa enable row level security;
alter table public.asesmen_awal enable row level security;
alter table public.ppi enable row level security;
alter table public.tujuan_ppi enable row level security;
alter table public.observasi enable row level security;
alter table public.analisis_ai enable row level security;

create policy "own profile" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own classes" on public.kelas for all using (guru_id = auth.uid()) with check (guru_id = auth.uid());
create policy "own students" on public.siswa for all using (guru_id = auth.uid()) with check (guru_id = auth.uid());
create policy "own baseline" on public.asesmen_awal for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));
create policy "own ppi" on public.ppi for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));
create policy "own goals" on public.tujuan_ppi for all
  using (exists (select 1 from public.ppi p join public.siswa s on s.id = p.siswa_id where p.id = ppi_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.ppi p join public.siswa s on s.id = p.siswa_id where p.id = ppi_id and s.guru_id = auth.uid()));
create policy "own observations" on public.observasi for all using (guru_id = auth.uid()) with check (guru_id = auth.uid());
create policy "own analyses" on public.analisis_ai for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));

create index kelas_guru_idx on public.kelas(guru_id);
create index siswa_guru_idx on public.siswa(guru_id);
create index siswa_kelas_idx on public.siswa(kelas_id);
create index observasi_siswa_tanggal_idx on public.observasi(siswa_id, tanggal);
create index ppi_siswa_idx on public.ppi(siswa_id);
