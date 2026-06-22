alter table public.daily_tracking
  add column if not exists sesi_ke integer not null default 1
    check (sesi_ke > 0);

with numbered_sessions as (
  select
    id,
    dense_rank() over (
      partition by siswa_id
      order by tanggal
    ) as inferred_session
  from public.daily_tracking
)
update public.daily_tracking tracking
set sesi_ke = numbered_sessions.inferred_session
from numbered_sessions
where tracking.id = numbered_sessions.id;

create index if not exists daily_tracking_student_session_idx
  on public.daily_tracking(siswa_id, sesi_ke);
