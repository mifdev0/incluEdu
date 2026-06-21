alter table public.siswa
  add column if not exists riwayat_perkembangan text,
  add column if not exists layanan_sebelumnya text,
  add column if not exists sumber_rujukan text,
  add column if not exists akomodasi jsonb not null default '[]'::jsonb;

alter table public.asesmen_awal
  add column if not exists membaca text,
  add column if not exists menulis text,
  add column if not exists matematika text,
  add column if not exists konsentrasi text,
  add column if not exists kemandirian text;

alter table public.tujuan_ppi
  add column if not exists aktivitas text,
  add column if not exists media_alat text,
  add column if not exists pelaksana text,
  add column if not exists frekuensi text,
  add column if not exists metode_evaluasi text,
  add column if not exists langkah_tugas jsonb not null default '[]'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.evaluasi_tujuan_ppi (
  id uuid primary key default gen_random_uuid(),
  tujuan_ppi_id uuid not null references public.tujuan_ppi(id) on delete cascade,
  capaian_sebelum integer not null check (capaian_sebelum between 0 and 100),
  status_sebelum public.status_tujuan not null,
  catatan text not null,
  tindak_lanjut text not null check (tindak_lanjut in ('lanjutkan', 'revisi', 'hentikan', 'tercapai')),
  dibuat_oleh uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.evaluasi_tujuan_ppi enable row level security;

create policy "own goal evaluations" on public.evaluasi_tujuan_ppi for all
  using (
    exists (
      select 1
      from public.tujuan_ppi t
      join public.ppi p on p.id = t.ppi_id
      join public.siswa s on s.id = p.siswa_id
      where t.id = tujuan_ppi_id
        and s.guru_id = auth.uid()
    )
  )
  with check (
    dibuat_oleh = auth.uid()
    and exists (
      select 1
      from public.tujuan_ppi t
      join public.ppi p on p.id = t.ppi_id
      join public.siswa s on s.id = p.siswa_id
      where t.id = tujuan_ppi_id
        and s.guru_id = auth.uid()
    )
  );

create index if not exists evaluasi_tujuan_ppi_tujuan_idx
  on public.evaluasi_tujuan_ppi(tujuan_ppi_id, created_at);
