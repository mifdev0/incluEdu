alter table public.assessment_responses
  add column if not exists fase_uji text
    check (fase_uji is null or fase_uji in ('A', 'B', 'C', 'D', 'E', 'F'));

create index if not exists assessment_responses_phase_idx
  on public.assessment_responses(siswa_id, fase_uji, domain);
