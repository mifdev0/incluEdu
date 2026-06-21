alter table public.siswa
  add column if not exists status_diagnosis text not null default 'diketahui'
    check (status_diagnosis in ('diketahui', 'dugaan', 'belum_terdiagnosis')),
  add column if not exists saran_referral text;

create table if not exists public.ppi_teams (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  nama text not null,
  peran text not null check (peran in ('guru_kelas', 'orang_tua', 'kepala_sekolah', 'guru_bk', 'gpk', 'psikolog', 'terapis', 'lainnya')),
  wajib boolean not null default false,
  dikonfirmasi boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  domain text not null check (domain in ('akademik', 'sikap_belajar', 'sosial_emosional', 'adl', 'motorik_kasar', 'motorik_halus')),
  item_key text not null,
  item_label text not null,
  nilai text not null check (nilai in ('mandiri', 'kadang', 'butuh_bantuan', 'belum_bisa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (siswa_id, item_key)
);

create table if not exists public.assessment_summaries (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null unique references public.siswa(id) on delete cascade,
  kekuatan jsonb not null default '[]'::jsonb,
  kebutuhan jsonb not null default '[]'::jsonb,
  ringkasan text,
  model text,
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_cp (
  id text primary key,
  mata_pelajaran text not null,
  fase text not null check (fase in ('A', 'B', 'C', 'D', 'E', 'F')),
  jenjang text not null,
  kelas_setara text,
  nama_elemen text not null,
  deskripsi_cp text not null,
  indikator_operasional jsonb not null default '[]'::jsonb,
  sumber text not null default 'Kemdikbudristek - Kurikulum Merdeka',
  created_at timestamptz not null default now()
);

alter table public.tujuan_ppi
  add column if not exists jenis_target text not null default 'non_akademik'
    check (jenis_target in ('akademik', 'non_akademik')),
  add column if not exists cp_id text references public.curriculum_cp(id) on delete set null,
  add column if not exists fase_adaptasi text,
  add column if not exists kriteria_tuntas text,
  add column if not exists skor_benar_target integer,
  add column if not exists skor_total_target integer;

create table if not exists public.goal_accommodations (
  id uuid primary key default gen_random_uuid(),
  tujuan_ppi_id uuid not null references public.tujuan_ppi(id) on delete cascade,
  jenis text not null check (jenis in ('media', 'strategi', 'durasi', 'layanan_tambahan')),
  deskripsi text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_tracking (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  tujuan_ppi_id uuid not null references public.tujuan_ppi(id) on delete cascade,
  guru_id uuid not null references public.profiles(id) on delete cascade,
  tanggal date not null default current_date,
  langkah_index integer not null default 0,
  langkah_label text not null,
  kode_bantuan text not null check (kode_bantuan in ('+', '±', 'P', 'D', 'Bv', 'Bf')),
  benar integer check (benar is null or benar >= 0),
  total integer check (total is null or total > 0),
  catatan text,
  created_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  tujuan_ppi_id uuid references public.tujuan_ppi(id) on delete cascade,
  periode text not null,
  jenis_target text not null check (jenis_target in ('akademik', 'non_akademik')),
  nilai_angka integer check (nilai_angka is null or nilai_angka between 0 and 100),
  ketercapaian integer not null check (ketercapaian between 0 and 100),
  narasi text not null,
  rekomendasi text not null check (rekomendasi in ('lanjut', 'remedial')),
  model text,
  created_at timestamptz not null default now()
);

alter table public.ppi_teams enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.assessment_summaries enable row level security;
alter table public.curriculum_cp enable row level security;
alter table public.goal_accommodations enable row level security;
alter table public.daily_tracking enable row level security;
alter table public.evaluations enable row level security;

create policy "authenticated read curriculum cp" on public.curriculum_cp
  for select to authenticated using (true);

create policy "own ppi teams" on public.ppi_teams for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));

create policy "own assessment responses" on public.assessment_responses for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));

create policy "own assessment summaries" on public.assessment_summaries for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));

create policy "own goal accommodations" on public.goal_accommodations for all
  using (exists (
    select 1 from public.tujuan_ppi t
    join public.ppi p on p.id = t.ppi_id
    join public.siswa s on s.id = p.siswa_id
    where t.id = tujuan_ppi_id and s.guru_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.tujuan_ppi t
    join public.ppi p on p.id = t.ppi_id
    join public.siswa s on s.id = p.siswa_id
    where t.id = tujuan_ppi_id and s.guru_id = auth.uid()
  ));

create policy "own daily tracking" on public.daily_tracking for all
  using (guru_id = auth.uid())
  with check (guru_id = auth.uid() and exists (
    select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()
  ));

create policy "own evaluations" on public.evaluations for all
  using (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()))
  with check (exists (select 1 from public.siswa s where s.id = siswa_id and s.guru_id = auth.uid()));

create index if not exists ppi_teams_siswa_idx on public.ppi_teams(siswa_id);
create index if not exists assessment_responses_siswa_idx on public.assessment_responses(siswa_id, domain);
create index if not exists curriculum_cp_filter_idx on public.curriculum_cp(jenjang, fase, mata_pelajaran);
create index if not exists daily_tracking_goal_date_idx on public.daily_tracking(tujuan_ppi_id, tanggal);
create index if not exists evaluations_siswa_idx on public.evaluations(siswa_id, created_at);
