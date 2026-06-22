alter table public.ppi
  add column if not exists nama_penyetuju text,
  add column if not exists hubungan_penyetuju text,
  add column if not exists tanggal_persetujuan date,
  add column if not exists catatan_persetujuan text;

create index if not exists ppi_status_approval_idx
  on public.ppi(siswa_id, status, tanggal_persetujuan);
