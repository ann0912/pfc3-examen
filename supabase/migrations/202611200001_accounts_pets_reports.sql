-- Ampliación compatible: conserva los reportes históricos y sus estados.
-- Aplicar después de revisar el proyecto y antes de publicar la nueva interfaz.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null check (char_length(btrim(full_name)) between 3 and 120),
  phone text not null check (phone ~ '^[0-9+ ()-]{7,20}$'),
  district text not null check (district in ('Los Olivos','Comas','San Martín de Porres','Independencia')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, email, full_name, phone, district)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name',
          new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'district');
  return new;
end;
$$;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;
drop trigger if exists auth_user_profile_created on auth.users;
create trigger auth_user_profile_created after insert on auth.users
for each row execute function public.create_profile_for_auth_user();

create table if not exists public.municipal_roles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('fiscalizador','supervisor','administrador')),
  created_at timestamptz not null default now()
);

create or replace function public.has_municipal_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from public.municipal_roles
    where user_id = (select auth.uid()) and role = any(allowed_roles)
  );
$$;
revoke all on function public.has_municipal_role(text[]) from public, anon;
grant execute on function public.has_municipal_role(text[]) to authenticated;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  species text not null check (species in ('Perro','Gato','Otro')),
  breed text check (breed is null or char_length(btrim(breed)) between 1 and 80),
  age_years numeric(4,1) not null check (age_years between 0 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pets_owner_created_idx on public.pets(owner_id,created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists pets_updated_at on public.pets;
create trigger pets_updated_at before update on public.pets
for each row execute function public.set_updated_at();

-- Los registros antiguos conservan owner_id/code nulos y estado Pendiente.
alter table public.critical_reports
  add column if not exists owner_id uuid references public.profiles(id) on delete set null,
  add column if not exists code text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists updated_at timestamptz not null default now();
create sequence if not exists public.critical_report_code_seq;
alter sequence public.critical_report_code_seq owned by public.critical_reports.code;
alter table public.critical_reports alter column code
  set default ('LN-' || lpad(nextval('public.critical_report_code_seq')::text, 8, '0'));
alter table public.critical_reports alter column owner_id set default auth.uid();
alter table public.critical_reports alter column status set default 'Recibido';
alter table public.critical_reports drop constraint if exists critical_reports_status_check;
alter table public.critical_reports add constraint critical_reports_status_check
  check (status in ('Pendiente','Recibido','En revisión','Asignado','En atención','Atendido','Cerrado'));
alter table public.critical_reports add constraint critical_reports_coordinates_check
  check ((latitude is null and longitude is null) or
         (latitude is not null and longitude is not null and
          latitude between -12.5 and -11.5 and longitude between -77.5 and -76.5));
create unique index if not exists critical_reports_code_unique on public.critical_reports(code);
create index if not exists critical_reports_owner_created_idx on public.critical_reports(owner_id,created_at desc);
create index if not exists critical_reports_status_created_idx on public.critical_reports(status,created_at desc);
drop trigger if exists critical_reports_updated_at on public.critical_reports;
create trigger critical_reports_updated_at before update on public.critical_reports
for each row execute function public.set_updated_at();

create or replace function public.prepare_report_insert()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  new.owner_id := (select auth.uid());
  new.status := 'Recibido';
  new.code := 'LN-' || lpad(nextval('public.critical_report_code_seq')::text,8,'0');
  return new;
end;
$$;
revoke all on function public.prepare_report_insert() from public,anon,authenticated;
drop trigger if exists critical_reports_prepare_insert on public.critical_reports;
create trigger critical_reports_prepare_insert before insert on public.critical_reports
for each row execute function public.prepare_report_insert();

alter table public.profiles enable row level security;
alter table public.municipal_roles enable row level security;
alter table public.pets enable row level security;

revoke all on public.profiles,public.municipal_roles,public.pets from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(full_name,phone,district) on public.profiles to authenticated;
grant select,insert,update,delete on public.pets to authenticated;
grant select,insert,update,delete on public.municipal_roles to authenticated;

create policy profiles_read_self on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.has_municipal_role(array['supervisor','administrador']));
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy municipal_roles_read on public.municipal_roles for select to authenticated
  using (user_id = (select auth.uid()) or public.has_municipal_role(array['supervisor','administrador']));
create policy municipal_roles_create on public.municipal_roles for insert to authenticated
  with check (public.has_municipal_role(array['administrador']));
create policy municipal_roles_update on public.municipal_roles for update to authenticated
  using (public.has_municipal_role(array['administrador']))
  with check (public.has_municipal_role(array['administrador']));
create policy municipal_roles_delete on public.municipal_roles for delete to authenticated
  using (public.has_municipal_role(array['administrador']));
create policy pets_read_own on public.pets for select to authenticated
  using (owner_id = (select auth.uid()));
create policy pets_insert_own on public.pets for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy pets_update_own on public.pets for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy pets_delete_own on public.pets for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "public_read_reports" on public.critical_reports;
drop policy if exists "public_insert_pending_reports" on public.critical_reports;
revoke all on public.critical_reports from anon,authenticated;
grant select,insert on public.critical_reports to authenticated;
grant update(status) on public.critical_reports to authenticated;
create policy reports_read_own_or_municipal on public.critical_reports for select to authenticated
  using (owner_id = (select auth.uid()) or
         public.has_municipal_role(array['fiscalizador','supervisor','administrador']));
create policy reports_insert_own on public.critical_reports for insert to authenticated
  with check (owner_id = (select auth.uid()) and status = 'Recibido');
create policy reports_update_municipal on public.critical_reports for update to authenticated
  using (public.has_municipal_role(array['fiscalizador','supervisor','administrador']))
  with check (public.has_municipal_role(array['fiscalizador','supervisor','administrador']));

-- La vista pública excluye propietario, descripción y ubicación exacta.
create or replace view public.public_report_locations with (security_barrier = true) as
select id, code, district, category, reference, status, created_at,
       round(latitude,3) as latitude, round(longitude,3) as longitude
from public.critical_reports where latitude is not null and longitude is not null;
revoke all on public.public_report_locations from public,anon,authenticated;
grant select on public.public_report_locations to anon,authenticated;

-- Primer administrador: alta manual por personal autorizado después de
-- registrar una cuenta. No existe ruta de autoconcesión desde el navegador.
