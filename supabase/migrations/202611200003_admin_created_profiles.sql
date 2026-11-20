-- Supabase Dashboard crea usuarios sin los metadatos del formulario público.
-- Conserva el perfil y deja los datos aún no proporcionados sin inventar.
alter table public.profiles alter column phone drop not null;
alter table public.profiles alter column district drop not null;

create or replace function public.create_profile_for_auth_user()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  insert into public.profiles (id, email, full_name, phone, district)
  values (
    new.id,
    new.email,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'full_name'), ''), 'Usuario'),
    nullif(btrim(new.raw_user_meta_data->>'phone'), ''),
    nullif(btrim(new.raw_user_meta_data->>'district'), '')
  );
  return new;
end;
$$;
revoke all on function public.create_profile_for_auth_user() from public, anon, authenticated;
