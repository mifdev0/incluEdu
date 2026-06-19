insert into public.profiles (id, nama, sekolah)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'nama', ''),
    split_part(users.email, '@', 1),
    'Guru IncluEdu'
  ),
  nullif(users.raw_user_meta_data ->> 'sekolah', '')
from auth.users as users
where not exists (
  select 1
  from public.profiles as profiles
  where profiles.id = users.id
);
