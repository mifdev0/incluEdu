alter table public.assessment_summaries
  add column if not exists rekomendasi_fase jsonb not null default '[]'::jsonb;
