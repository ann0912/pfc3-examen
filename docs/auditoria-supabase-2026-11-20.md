# Auditoría Supabase PC2 — 20/11/2026

Proyecto inspeccionado: `pqgfhgpeilncwyoyymgq`. Consultas de solo lectura en SQL Editor antes del cambio; migración local `202611200004_function_privileges.sql` ejecutada allí después de verificar dependencias. El editor confirmó `Success. No rows returned`.

## Hallazgos y comprobaciones

- `public.rls_auto_enable()` pertenece a `postgres`, es `SECURITY DEFINER`, usa `search_path=pg_catalog` y es el objetivo del disparador DDL activo `ensure_rls`. Antes tenía ACL nula, por lo que `PUBLIC` podía ejecutarla. Después de la migración, ACL `{postgres=X/postgres}` y `has_function_privilege('anon', ..., 'EXECUTE') = false`. El disparador no se eliminó.
- `public.has_municipal_role(text[])` pertenece a `postgres`, es `SECURITY DEFINER` y consulta `public.municipal_roles` por `auth.uid()`. Antes ya tenía ejecución para `authenticated` y no para `anon`; la migración conservó esos permisos y cambió `search_path` de `public, pg_temp` a vacío. Después: ACL `{postgres=X/postgres,authenticated=X/postgres}`, ejecución `anon=false` y la llamada sin sesión para `administrador` devolvió `false`.
- Las nueve tablas de `public` (`critical_reports`, `inspections`, `municipal_roles`, `notifications`, `pets`, `profiles`, `report_assignments`, `report_photos`, `report_status_history`) tienen RLS habilitado. Se observaron políticas por propietario y por rol municipal, pero todavía faltan pruebas de autorización con identidades independientes.
- `public.public_report_locations` pertenece a `postgres`, usa `security_barrier=true` y es una vista con privilegios del definidor. Expone `id`, código, distrito, categoría, referencia, estado, fecha y coordenadas redondeadas a tres decimales de reportes con ubicación. La referencia es texto libre y requiere revisión de privacidad; no se cambió la vista sin validar el mapa y su modelo de acceso.
- No existe la relación `supabase_migrations.schema_migrations` en el proyecto inspeccionado. Las migraciones 001–004 se ejecutaron por SQL Editor; su historial no está registrado en la tabla CLI. No se deben reaplicar basándose en un historial vacío. Antes de adoptar Supabase CLI, reconciliar el esquema real con las versiones locales.
- Tras la migración, Security Advisor mostró un error (`public.public_report_locations`) y dos advertencias (`has_municipal_role` ejecutable por autenticados y protección de contraseñas filtradas desactivada). El aviso anterior de `rls_auto_enable` desapareció. El permiso autenticado de `has_municipal_role` es necesario para las políticas actuales y la función limita su consulta a `auth.uid()`; no se revocó a ciegas. El panel indica plan Free; la protección de contraseñas filtradas requiere Pro o superior según la documentación de Supabase.
- Tres perfiles de prueba fueron confirmados: `prueba1@test.com` y `prueba2@test.com` sin rol municipal; `prueba3@test.com` con rol `fiscalizador`. La asignación se hizo en el SQL Editor a la tercera cuenta únicamente y se verificó con una consulta posterior. Crear perfiles y asignar el rol no equivale a haber probado sus sesiones ni políticas RLS.

## Calidad local posterior

`npm.cmd test`: 11/11; `npm.cmd run lint`, `typecheck`, `security` y `build`: correctos. El script `typecheck` comprueba sintaxis JavaScript; el proyecto no contiene TypeScript. `npm.cmd audit --audit-level=low` no pudo consultar el endpoint del registro npm por error de red; queda sin resultado en esta ejecución.

## Pendientes críticos

1. Probar con dos ciudadanos y un usuario municipal de prueba, con sesiones reales, acceso cruzado, operaciones autorizadas, almacenamiento y persistencia. La prueba de una sola sesión ciudadana no acredita separación entre usuarios.
2. Probar las tres sesiones y resolver o justificar los avisos restantes del asesor. Habilitar la protección de contraseñas filtradas requiere cambiar del plan Free a Pro o superior y activarla en Authentication > Settings; no se hizo ningún cambio de plan.
3. Resolver la salida pública de `public_report_locations`, especialmente el campo `reference`, sin romper el mapa anónimo.
4. No hacer merge ni despliegue hasta completar los controles anteriores.
