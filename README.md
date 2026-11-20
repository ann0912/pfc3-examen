# Base vacía para PFC III

Abre esta carpeta en Codex. Lee AGENTS.md antes de comenzar. Las herramientas
quedan preparadas como estructura y configuración inicial. El caso se incorpora
cuando se entregue el enunciado.

## Preparación previa

1. GitHub. Crea un repositorio privado vacío llamado pfc3-examen, salvo que el
   profesor indique otro nombre o visibilidad. Desde esta carpeta en PowerShell:

   ```powershell
   git init -b main
   git add .
   git diff --cached --check
   git commit -m "chore: preparar base vacía para PFC III"
   git remote add origin https://github.com/TU-USUARIO/pfc3-examen.git
   git push -u origin main
   ```

   Abre Actions y comprueba el check inicial. Si Git pide identidad, configura
   user.name y user.email para este repositorio. El check inicial comprueba el
   formato del diff. Los controles de aplicación se añaden al definir el stack.

2. Jira. Crea un proyecto Scrum vacío en tu sitio, con nombre PFC III Examen y
   clave PFC3 si está libre. Comprueba que puedes abrir el tablero y el backlog.
3. Supabase. Crea un proyecto vacío y conserva el enlace del panel. El archivo
   .env.example sirve de referencia si el caso usa Next.js. Guarda credenciales
   locales en .env.local. Las variables públicas del cliente nunca contienen
   credenciales secretas.
4. Vercel. Comprueba acceso a tu cuenta y que puedes seleccionar el repositorio
   al preparar la importación. Completa la importación al tener una aplicación
   compilable. Una carpeta de documentación sola todavía no es una demo.

## Día del examen

Entrega a Codex el enunciado, la rúbrica y el material de clase, y dile:
«Lee AGENTS.md y analiza este enunciado. Completa docs/entrega.md con los
requisitos. Implementa y verifica primero el flujo mínimo que pueda demostrar».

Antes de entregar, abre los enlaces y archivos que pide el enunciado. Comprueba
que el profesor tiene el acceso necesario y que adjuntas el formato solicitado.
