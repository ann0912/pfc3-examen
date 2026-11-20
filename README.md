# Lima Norte Saludable

Aplicación web PC2 para registro ciudadano de mascotas e incidencias de salubridad, seguimiento municipal y visualización pública de ubicaciones aproximadas en Lima Norte.

## Producción

- Web: https://pfc3-examen.vercel.app/
- Repositorio: https://github.com/ann0912/pfc3-examen
- PR funcional PC2: https://github.com/ann0912/pfc3-examen/pull/5
- PR de cierre documental: https://github.com/ann0912/pfc3-examen/pull/8
- Commit auditado antes del cierre documental: `8a6359851b5eefc4ab6f5aee9ac994fb3eac6107`
- CI/CD auditado: https://github.com/ann0912/pfc3-examen/actions/runs/44704978497

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

## Jira y limitaciones conocidas

Jira muestra SCRUM-9 a SCRUM-24 en estado `Finalizada`. Ese estado administrativo no elimina estas limitaciones comprobadas:

- **SCRUM-9:** el registro funciona, pero la validación repetida de altas quedó limitada por el rate limit de correos de Supabase.
- **SCRUM-17:** existe asignación de roles desde el panel para administradores, pero no una interfaz completa de administración de funcionarios; el alta inicial y ciertos ajustes continúan realizándose manualmente en Supabase.
- Las pruebas E2E autenticadas requieren cuentas de prueba y sesiones separadas. No deben incluirse contraseñas ni estado de sesión en el repositorio o ZIP.

## Documentación

- `docs/entrega.md`: rúbrica, evidencias y cierre de entrega.
- `docs/informe.md`: informe técnico completo.
- `docs/informe-PC2.docx`: informe Word entregable.
- `docs/auditoria-supabase-2026-11-20.md`: auditoría de RLS, funciones, vista y Storage.
- `docs/backlog.md`: épicas e historias SCRUM-5 a SCRUM-24.

No incluyas `.env.local`, tokens, contraseñas, `node_modules`, `dist` ni temporales en el ZIP de entrega.
