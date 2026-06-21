create table if not exists public.panduan_konfirmasi (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null unique references public.siswa(id) on delete cascade,
  kategori text not null,
  checklist jsonb not null default '[]'::jsonb,
  dikonfirmasi_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.panduan_konfirmasi enable row level security;

create policy "own guide confirmations" on public.panduan_konfirmasi for all
  using (
    exists (
      select 1
      from public.siswa s
      where s.id = siswa_id
        and s.guru_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.siswa s
      where s.id = siswa_id
        and s.guru_id = auth.uid()
    )
  );

create index if not exists panduan_konfirmasi_siswa_idx
  on public.panduan_konfirmasi(siswa_id);
