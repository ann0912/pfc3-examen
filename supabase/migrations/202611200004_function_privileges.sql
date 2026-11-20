-- Endurece funciones expuestas sin alterar las políticas RLS ni los datos.
-- Esta migración no modifica public_report_locations: su referencia textual
-- requiere una revisión de privacidad separada antes de cambiar la vista.

create or replace function public.has_municipal_role(allowed_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.municipal_roles
    where user_id = (select auth.uid()) and role = any(allowed_roles)
  );
$$;
revoke all on function public.has_municipal_role(text[]) from public, anon, authenticated;
grant execute on function public.has_municipal_role(text[]) to authenticated;

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
