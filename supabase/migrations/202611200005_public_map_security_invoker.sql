-- Publica únicamente datos sanitizados para el mapa anónimo.
-- Evita que la vista ejecute consultas sobre critical_reports con privilegios de postgres.

create table if not exists public.public_report_locations_cache (
  id uuid primary key references public.critical_reports(id) on delete cascade,
  code text,
  district text not null,
  category text not null,
  reference text not null,
  status text not null,
  created_at timestamptz not null,
  latitude numeric(6,3) not null,
  longitude numeric(6,3) not null
);

alter table public.public_report_locations_cache enable row level security;
revoke all on public.public_report_locations_cache from public, anon, authenticated;
grant select on public.public_report_locations_cache to anon, authenticated;

drop policy if exists public_map_read on public.public_report_locations_cache;
create policy public_map_read on public.public_report_locations_cache
for select to anon, authenticated using (true);

create or replace function public.sync_public_report_location()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.public_report_locations_cache where id = old.id;
    return old;
  end if;

  if new.latitude is null or new.longitude is null then
    delete from public.public_report_locations_cache where id = new.id;
  else
    insert into public.public_report_locations_cache
      (id, code, district, category, reference, status, created_at, latitude, longitude)
    values
      (new.id, new.code, new.district, new.category,
       new.district || ' · ubicación aproximada', new.status, new.created_at,
       round(new.latitude, 3), round(new.longitude, 3))
    on conflict (id) do update set
      code = excluded.code,
      district = excluded.district,
      category = excluded.category,
      reference = excluded.reference,
      status = excluded.status,
      created_at = excluded.created_at,
      latitude = excluded.latitude,
      longitude = excluded.longitude;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_public_report_location() from public, anon, authenticated;

drop trigger if exists critical_reports_sync_public_location on public.critical_reports;
create trigger critical_reports_sync_public_location
after insert or update of code, district, category, status, latitude, longitude or delete
on public.critical_reports
for each row execute function public.sync_public_report_location();

insert into public.public_report_locations_cache
  (id, code, district, category, reference, status, created_at, latitude, longitude)
select id, code, district, category,
       district || ' · ubicación aproximada', status, created_at,
       round(latitude, 3), round(longitude, 3)
from public.critical_reports
where latitude is not null and longitude is not null
on conflict (id) do update set
  code = excluded.code,
  district = excluded.district,
  category = excluded.category,
  reference = excluded.reference,
  status = excluded.status,
  created_at = excluded.created_at,
  latitude = excluded.latitude,
  longitude = excluded.longitude;

create or replace view public.public_report_locations
with (security_invoker = true, security_barrier = true)
as
select id, code, district, category, reference, status, created_at,
       latitude::numeric as latitude, longitude::numeric as longitude
from public.public_report_locations_cache;

revoke all on public.public_report_locations from public, anon, authenticated;
grant select on public.public_report_locations to anon, authenticated;
