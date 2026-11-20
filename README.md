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

El build queda en `dist/`. Si se configura `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, el build genera una configuración pública para el cliente. La migración SQL de `supabase/migrations` fue aplicada por el propietario del proyecto. `npm.cmd run verify:remote` comprobó inserción, lectura y rechazo anónimo de PATCH/DELETE con datos ficticios. No escribas claves secretas en el repositorio.

## Estado de integraciones

La rama de trabajo tiene una ejecución de GitHub Actions con build, test y security correctos para un commit anterior. El backlog SCRUM se consultó en modo lectura; faltan capturas y comprobación del acceso del docente. Falta verificar el recorrido en navegador contra Supabase y el despliegue público de Vercel.

## Contexto de la base

Este repositorio comenzó como una estructura vacía con un workflow de revisión de diff. La aplicación y los documentos tienen un primer commit publicado en la rama de trabajo; los cambios posteriores requieren revisión y publicación.
