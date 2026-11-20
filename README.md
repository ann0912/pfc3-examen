# Lima Norte Saludable

Aplicación web PC2 para registro ciudadano de mascotas e incidencias de salubridad, seguimiento municipal y visualización pública de ubicaciones aproximadas en Lima Norte.

## Producción

- Web: https://pfc3-examen.vercel.app/
- Repositorio: https://github.com/ann0912/pfc3-examen
- PR del incremento PC2: https://github.com/ann0912/pfc3-examen/pull/5
- Merge de PC2 en `main`: `804424e97ff79321d7a133cb983649afcc82d39f`
- CI/CD: https://github.com/ann0912/pfc3-examen/actions/runs/44695736671

El run de `main` aprobó build, 12 pruebas, análisis de seguridad, Gitleaks, `npm audit`, CodeQL y despliegue de Vercel. La aplicación usa Supabase Auth, PostgreSQL con RLS y Storage privado. El frontend solo recibe la URL y la clave publicable; no usa `service_role` ni credenciales administrativas.

## Verificación local

```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run security
npm.cmd run build
npm.cmd audit --audit-level=low
```

El build queda en `dist/`. Para conectar Supabase se requiere un `.env.local` no versionado con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Base de datos y seguridad

Las migraciones versionadas están en `supabase/migrations`. Las migraciones `202611200004_function_privileges.sql` y `202611200005_public_map_security_invoker.sql` aplican mínimo privilegio a funciones y reemplazan la vista pública con una vista `security_invoker` sobre una caché mínima protegida por RLS.

Las pruebas con `prueba1@test.com`, `prueba2@test.com` y `prueba3@test.com` verificaron aislamiento bilateral de mascotas y reportes, operaciones propias, fiscalización asignada, persistencia y bloqueo de modificación ajena. Storage rechazó mediante su API el borrado de una foto privada de A por B y el objeto permaneció intacto.

Quedan dos advertencias no críticas de Supabase documentadas en `docs/auditoria-supabase-2026-11-20.md`: la ejecución autenticada de `has_municipal_role`, necesaria y limitada a `auth.uid()`, y la protección de contraseñas filtradas, que requiere plan Pro o superior.

## Documentación

- `docs/entrega.md`: rúbrica, evidencias y cierre de entrega.
- `docs/informe.md`: informe técnico completo.
- `docs/informe-PC2.docx`: informe Word entregable.
- `docs/auditoria-supabase-2026-11-20.md`: auditoría de RLS, funciones, vista y Storage.
- `docs/backlog.md`: épicas e historias SCRUM-5 a SCRUM-24.

No incluyas `.env.local`, tokens, contraseñas, `node_modules`, `dist` ni temporales en el ZIP de entrega.
