# Mascotas y salubridad en Lima Norte

Prototipo académico local. La interfaz actual permite registrar reportes ciudadanos anónimos y consultarlos por distrito en el mismo navegador. Usa `localStorage` si no hay configuración Supabase. No incluye cuentas, registro de mascotas, mapa, fotos ni gestión municipal.

La fuente de verdad documental es [docs/backlog.md](docs/backlog.md): épicas reales `SCRUM-5` a `SCRUM-8` e historias `SCRUM-9` a `SCRUM-24`, con puntos y dependencias. Se comprobaron en Jira mediante lectura, sin modificarlo. [docs/entrega.md](docs/entrega.md) conserva la rúbrica literal; [docs/informe.md](docs/informe.md) distingue implementación local y la **SIMULACIÓN ACADÉMICA** de cuatro sprints de 60 minutos, H0–H4.

## Comprobación local

```powershell
npm.cmd ci --offline
npm.cmd run lint
npm.cmd test
npm.cmd run security
npm.cmd run build
```

El build queda en `dist/`. Si se configura `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, el build genera una configuración pública para el cliente. La migración SQL está en `supabase/migrations`; no se ha aplicado ni verificado en un proyecto remoto. No escribas claves secretas en el repositorio.

## Estado de integraciones

La rama local de trabajo y el workflow están preparados. El backlog SCRUM se consultó en modo lectura; faltan capturas y comprobación del acceso del docente. Supabase, GitHub Actions y Vercel requieren verificación real antes de afirmar que están conectados o desplegados.

## Contexto de la base

Este repositorio comenzó como una estructura vacía con un workflow de revisión de diff. Los archivos de aplicación y documentación actuales son trabajo local sin commit ni despliegue verificados.
