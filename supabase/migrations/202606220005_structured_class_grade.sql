alter table public.kelas
  add column if not exists tingkat smallint
    check (tingkat is null or tingkat between 1 and 12);

update public.kelas
set tingkat = case
  when substring(nama from '([0-9]+)') is not null
    then least(12, greatest(1, substring(nama from '([0-9]+)')::smallint))
  when jenjang = 'SD' then 1
  when jenjang = 'SMP' then 7
  when jenjang = 'SMA' then 10
  else null
end
where tingkat is null;

create index if not exists kelas_tingkat_idx
  on public.kelas(guru_id, jenjang, tingkat);
