-- Gestión municipal y evidencias. Requiere 202611200001.
create table if not exists public.report_assignments (
  report_id uuid primary key references public.critical_reports(id) on delete cascade,
  fiscalizador_id uuid not null references public.municipal_roles(user_id),
  assigned_by uuid not null default auth.uid() references public.municipal_roles(user_id),
  assigned_at timestamptz not null default now()
);
create index if not exists report_assignments_fiscalizador_idx on public.report_assignments(fiscalizador_id,assigned_at desc);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.critical_reports(id) on delete cascade,
  fiscalizador_id uuid not null default auth.uid() references public.municipal_roles(user_id),
  observations text not null check (char_length(btrim(observations)) between 15 and 2000),
  actions text not null check (char_length(btrim(actions)) between 5 and 2000),
  inspected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists inspections_report_created_idx on public.inspections(report_id,created_at desc);

create table if not exists public.report_status_history (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.critical_reports(id) on delete cascade,
  previous_status text not null,
  new_status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index if not exists report_status_history_report_idx on public.report_status_history(report_id,changed_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  report_id uuid not null references public.critical_reports(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 250),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);

create table if not exists public.report_photos (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.critical_reports(id) on delete cascade,
  owner_id uuid not null default auth.uid() references public.profiles(id),
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp')),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now(),
  constraint report_photos_owner_folder check (split_part(object_path,'/',1) = owner_id::text)
);
create index if not exists report_photos_report_idx on public.report_photos(report_id,created_at desc);

alter table public.report_assignments enable row level security;
alter table public.inspections enable row level security;
alter table public.report_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.report_photos enable row level security;
revoke all on public.report_assignments,public.inspections,public.report_status_history,
  public.notifications,public.report_photos from anon,authenticated;
grant select,insert,update on public.report_assignments to authenticated;
grant select,insert on public.inspections to authenticated;
grant select on public.report_status_history to authenticated;
grant select,update(read_at) on public.notifications to authenticated;
grant select,insert on public.report_photos to authenticated;

create policy assignment_read on public.report_assignments for select to authenticated
  using (fiscalizador_id = (select auth.uid()) or
         public.has_municipal_role(array['supervisor','administrador']));
create policy assignment_insert on public.report_assignments for insert to authenticated
  with check (assigned_by = (select auth.uid()) and
              public.has_municipal_role(array['supervisor','administrador']) and
              exists (select 1 from public.municipal_roles r
                      where r.user_id = fiscalizador_id and r.role = 'fiscalizador'));
create policy assignment_update on public.report_assignments for update to authenticated
  using (public.has_municipal_role(array['supervisor','administrador']))
  with check (public.has_municipal_role(array['supervisor','administrador']) and
              exists (select 1 from public.municipal_roles r
                      where r.user_id = fiscalizador_id and r.role = 'fiscalizador'));
create policy inspection_read on public.inspections for select to authenticated
  using (fiscalizador_id = (select auth.uid()) or
         public.has_municipal_role(array['supervisor','administrador']));
create policy inspection_insert on public.inspections for insert to authenticated
  with check (fiscalizador_id = (select auth.uid()) and
              public.has_municipal_role(array['fiscalizador']) and
              exists (select 1 from public.report_assignments a
                      where a.report_id = report_id and a.fiscalizador_id = (select auth.uid())));
create policy history_read on public.report_status_history for select to authenticated
  using (exists (select 1 from public.critical_reports r where r.id = report_id));
create policy notifications_read on public.notifications for select to authenticated
  using (recipient_id = (select auth.uid()));
create policy notifications_update on public.notifications for update to authenticated
  using (recipient_id = (select auth.uid())) with check (recipient_id = (select auth.uid()));
create policy photos_read on public.report_photos for select to authenticated
  using (owner_id = (select auth.uid()) or
         public.has_municipal_role(array['fiscalizador','supervisor','administrador']));
create policy photos_insert on public.report_photos for insert to authenticated
  with check (owner_id = (select auth.uid()) and
              exists (select 1 from public.critical_reports r
                      where r.id = report_id and r.owner_id = (select auth.uid())));

drop policy if exists reports_update_municipal on public.critical_reports;
create policy reports_update_municipal on public.critical_reports for update to authenticated
  using (public.has_municipal_role(array['supervisor','administrador']) or
         (public.has_municipal_role(array['fiscalizador']) and
          exists (select 1 from public.report_assignments a
                  where a.report_id = id and a.fiscalizador_id = (select auth.uid()))))
  with check (public.has_municipal_role(array['supervisor','administrador']) or
              (public.has_municipal_role(array['fiscalizador']) and
               exists (select 1 from public.report_assignments a
                       where a.report_id = id and a.fiscalizador_id = (select auth.uid()))));

create or replace function public.record_report_status_change()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if old.status is not distinct from new.status then return new; end if;
  if not ((old.status in ('Pendiente','Recibido') and new.status in ('En revisión','Asignado')) or
          (old.status = 'En revisión' and new.status = 'Asignado') or
          (old.status = 'Asignado' and new.status = 'En atención') or
          (old.status = 'En atención' and new.status = 'Atendido') or
          (old.status = 'Atendido' and new.status = 'Cerrado')) then
    raise exception 'Transición de estado no permitida';
  end if;
  insert into public.report_status_history(report_id,previous_status,new_status,changed_by)
  values (new.id,old.status,new.status,(select auth.uid()));
  if new.owner_id is not null then
    insert into public.notifications(recipient_id,report_id,message)
    values (new.owner_id,new.id,'El reporte ' || coalesce(new.code,'histórico') ||
            ' cambió a ' || new.status || '.');
  end if;
  return new;
end;
$$;
revoke all on function public.record_report_status_change() from public,anon,authenticated;
drop trigger if exists critical_reports_status_changed on public.critical_reports;
create trigger critical_reports_status_changed after update of status on public.critical_reports
for each row execute function public.record_report_status_change();

create or replace function public.mark_report_assigned()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.critical_reports set status = 'Asignado' where id = new.report_id
    and status in ('Recibido','Pendiente','En revisión');
  return new;
end;
$$;
revoke all on function public.mark_report_assigned() from public,anon,authenticated;
drop trigger if exists report_assignment_created on public.report_assignments;
create trigger report_assignment_created after insert on public.report_assignments
for each row execute function public.mark_report_assigned();

-- Bucket privado: el cliente solo escribe en su carpeta; lectura según rol.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('report-evidence','report-evidence',false,5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;
create policy evidence_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'report-evidence' and
              (storage.foldername(name))[1] = (select auth.uid())::text);
create policy evidence_read_own_or_municipal on storage.objects for select to authenticated
  using (bucket_id = 'report-evidence' and
         ((storage.foldername(name))[1] = (select auth.uid())::text or
          public.has_municipal_role(array['fiscalizador','supervisor','administrador'])));
