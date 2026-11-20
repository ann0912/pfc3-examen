-- Solo datos no personales: distrito y referencia pública, sin propietario ni ubicación precisa.
create table if not exists public.critical_reports (
  id uuid primary key default gen_random_uuid(),
  district text not null check (district in ('Los Olivos', 'Comas', 'San Martín de Porres', 'Independencia')),
  category text not null check (category in ('Heces acumuladas', 'Presencia de orina', 'Deterioro de espacio público', 'Mascota sin supervisión')),
  reference text not null check (char_length(btrim(reference)) between 5 and 120),
  description text not null check (char_length(btrim(description)) between 15 and 500),
  status text not null default 'Pendiente' check (status in ('Pendiente', 'En revisión', 'Atendido')),
  created_at timestamptz not null default now()
);

create index if not exists critical_reports_district_created_idx on public.critical_reports (district, created_at desc);
alter table public.critical_reports enable row level security;

revoke all on public.critical_reports from anon, authenticated;
grant select, insert on public.critical_reports to anon, authenticated;

create policy "public_read_reports" on public.critical_reports for select to anon, authenticated using (true);
create policy "public_insert_pending_reports" on public.critical_reports for insert to anon, authenticated
  with check (status = 'Pendiente');

-- No se concede UPDATE ni DELETE al cliente público. La gestión municipal
-- requerirá autenticación, rol y políticas adicionales antes de activarse.
