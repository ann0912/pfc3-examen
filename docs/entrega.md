> **Cierre PC2 del 20/11/2026:** los PR [#5](https://github.com/ann0912/pfc3-examen/pull/5), [#6](https://github.com/ann0912/pfc3-examen/pull/6), [#7](https://github.com/ann0912/pfc3-examen/pull/7) y [#8](https://github.com/ann0912/pfc3-examen/pull/8) consolidan la entrega en `main`; [Actions 44704978497](https://github.com/ann0912/pfc3-examen/actions/runs/44704978497) aprobó build, 12 pruebas, security/CodeQL y deploy. Vercel publicó [la versión PC2](https://pfc3-examen.vercel.app/). Las migraciones 004 y 005 están aplicadas; RLS y Storage se probaron con tres identidades controladas. Jira muestra SCRUM-9 a SCRUM-24 como Finalizadas, aunque SCRUM-9 conserva la limitación de rate limit de correo y SCRUM-17 no dispone de administración integral de funcionarios. Quedan dos advertencias no críticas justificadas en la auditoría: `has_municipal_role` ejecutable por autenticados y protección de contraseñas filtradas no disponible en el plan Free.

> **Estado histórico anterior:** [web pública](https://pfc3-examen.vercel.app/) probada en escritorio y móvil; [PR #1](https://github.com/ann0912/pfc3-examen/pull/1), [PR #2](https://github.com/ann0912/pfc3-examen/pull/2) y [PR #3](https://github.com/ann0912/pfc3-examen/pull/3) fusionados; [Actions 44677187328](https://github.com/ann0912/pfc3-examen/actions/runs/44677187328) con build/test/security/deploy aprobados. Las notas posteriores reemplazan este corte.

# Entrega: Mascotas y salubridad en Lima Norte

Fuente: `(10-26-2) PrácticaCalificada2-PFCIII-H.pdf`, páginas 1–3. El PDF imprime **120 minutos**; el estudiante corrigió la duración total del examen a **4 horas, hasta las 12:00 a. m.**. La planificación operativa usa H0–H4 y cuatro sprints de 60 minutos. Los 74 SP son esfuerzo relativo del backlog, no horas ni funcionalidades terminadas.

## Entregables literales del PDF

> Todo lo entregado (código, diagramas, tablero Scrum) debe ser entregado en un informe detallado.
>
> Agregar en el informe los enlaces al repositorio de GitHub, al proyecto de Jira y a la solución desplegada en la nube. Si algún enlace no está compartido con el docente, se descontará 1 punto por cada enlace.
>
> Enviar el código final de la solución en un archivo comprimido (.zip).
>
> Por cada pregunta se harán preguntas presenciales sobre lo implementado. Si el o la estudiante no responde satisfactoriamente, se elimina automáticamente el puntaje correspondiente a esa pregunta.

## Pregunta 1 — Product Backlog y épicas en Jira (5 pts)

> Construir en Jira el Product Backlog de la solución, organizado en épicas e historias de usuario detalladas y priorizadas.
>
> Épicas: mínimo 4 épicas que agrupen las capacidades principales del sistema, cada una con nombre, descripción y objetivo de negocio.
>
> Historias de usuario: formato «Como [rol], quiero [acción], para [beneficio]», vinculadas a su épica y con criterios de aceptación (Dado/Cuando/Entonces).
>
> Estimación y priorización: story points (planning poker u otra técnica) y prioridad (MoSCoW u otra técnica) en cada historia.
>
> Evidencia: capturas del backlog y de las épicas en Jira, y enlace al proyecto compartido con el docente.

| Criterio literal | Qué se evalúa literalmente | Pts |
|---|---|---:|
| Épicas definidas | Épicas coherentes con el caso, con descripción y objetivo | 1.5 |
| Historias de usuario | Bien formuladas, vinculadas a épicas y con criterios de aceptación | 1.5 |
| Estimación y priorización | Story points y prioridad asignados con criterio | 1 |
| Evidencia en Jira | Capturas y proyecto accesible mediante enlace | 1 |
| TOTAL | | 5 |

## Pregunta 2 — Simulación de 4 sprints: burndown, Gantt y tablero Kanban (5 pts)

> Simular la ejecución del proyecto en 4 sprints, evidenciando el avance de las historias de usuario y la planificación en el tiempo.
>
> Sprints: 4 sprints con duración, sprint goal y sprint backlog (historias asignadas y story points) para cada uno.
>
> Burndown: gráfico de quemado de historias de usuario por sprint (ideal vs. real) y velocidad obtenida.
>
> Diagrama de Gantt: cronograma con épicas e historias, fechas de inicio y fin, dependencias e hitos.
>
> Tablero Kanban: columnas To Do / In Progress / In Review / Done, con límites WIP y evidencia del flujo de las historias en cada sprint.

| Criterio literal | Qué se evalúa literalmente | Pts |
|---|---|---:|
| Planificación de sprints | 4 sprints con sprint goal, sprint backlog y story points | 1.5 |
| Burndown | Quemado de historias por sprint, ideal vs. real y velocidad | 1.5 |
| Diagrama de Gantt | Cronograma con fechas, dependencias e hitos | 1 |
| Tablero Kanban | Columnas, límites WIP y evidencia del avance | 1 |
| TOTAL | | 5 |

## Pregunta 3 — Arquitectura lógica y stack DevSecOps (5 pts)

> Presentar la arquitectura lógica de la solución y explicar el stack tecnológico utilizado en cada fase del ciclo de vida DevSecOps.
>
> Arquitectura lógica: capas/componentes del sistema (frontend, backend/API, base de datos, autenticación, servicios externos) y cómo se comunican.
>
> Ciclo de vida DevSecOps: herramientas por fase (plan, code, build, test, release, deploy, operate, monitor) y cómo se integra la seguridad en cada una.
>
> Justificación del stack: por qué se eligió cada herramienta y su coherencia con el caso.

| Criterio literal | Qué se evalúa literalmente | Pts |
|---|---|---:|
| Arquitectura lógica | Componentes y relaciones claras y coherentes con lo implementado | 2 |
| Stack en el ciclo DevSecOps | Herramientas ubicadas y explicadas en cada fase del ciclo | 1 |
| Seguridad integrada | Controles de seguridad explicados por fase (shift-left) | 1 |
| Vínculo con el caso | Stack justificado según el problema del caso | 1 |
| TOTAL | | 5 |

## Pregunta 4 — GitHub, pipeline CI/CD y despliegue en nube (5 pts)

> Publicar el código en GitHub con una estrategia de ramas definida y un pipeline automatizado que demuestre las pruebas, la seguridad implementada y el despliegue de la solución.
>
> Branching: rama main (producción) y una rama adicional para pruebas (p. ej., test), con commits descriptivos y Pull Requests hacia main.
>
> Pipeline CI/CD: explicación de cada etapa (build, test, análisis de seguridad, deploy) con evidencia de ejecuciones exitosas (p. ej., GitHub Actions).
>
> Pruebas: tests automatizados (unitarios y/o de integración) ejecutados en el pipeline, con resultados visibles.
>
> Seguridad implementada: SAST, análisis de dependencias, escaneo de secretos u otros controles integrados en el pipeline.
>
> Link a la solución: URL pública de la solución desplegada en la nube.

| Criterio literal | Qué se evalúa literalmente | Pts |
|---|---|---:|
| Estrategia de branching | Rama main y rama de pruebas, commits y PRs con evidencia | 1 |
| Pipeline explicado | Etapas del pipeline descritas y ejecutándose con éxito | 1 |
| Pruebas automatizadas | Tests ejecutados en el pipeline con resultados | 1 |
| Seguridad implementada | Controles de seguridad en el pipeline con evidencia | 1 |
| Link a la solución | Solución desplegada y accesible en la nube | 1 |
| TOTAL | | 5 |

## Flujo funcional mínimo del examen de cuatro horas

Prioridad: registrar una incidencia ficticia, comprobar que se guarda y se consulta tras recargar, y verificar permisos. Después: pipeline, despliegue, capturas, accesos y ZIP. El incremento PC2 usa Supabase para cuentas, mascotas y reportes; una sesión ciudadana comprobó la persistencia de mascota y reporte tras recargar. Falta probar autorización con tres identidades independientes, fotografías y fiscalización. Ninguna historia de SCRUM se declara completamente aceptada por una pantalla parcial.

| Bloque de 60 min | Prioridad de examen | Historia relacionada y alcance real |
|---|---|---|
| H0–H1 | Revisar requisitos, preparar recorrido y datos ficticios | SCRUM-13; SCRUM-9 a SCRUM-12 permanecen planificadas |
| H1–H2 | Registrar incidencia y consultarla | SCRUM-13 y SCRUM-18, cobertura parcial local |
| H2–H3 | Persistencia, permisos y pruebas | SQL aplicado y prueba remota de acceso anónimo correcta; recorrido web público pendiente |
| H3–H4 | Pipeline, despliegue, evidencias y ZIP | No afirmar completado hasta tener ejecución y enlaces |

## Fuente única de verdad SCRUM

Proyecto [SCRUM](https://anelis-pfc3.atlassian.net/jira/software/projects/SCRUM), consultado en modo lectura. Épicas reales [SCRUM-5](https://anelis-pfc3.atlassian.net/browse/SCRUM-5) a [SCRUM-8](https://anelis-pfc3.atlassian.net/browse/SCRUM-8); historias reales [SCRUM-9](https://anelis-pfc3.atlassian.net/browse/SCRUM-9) a [SCRUM-24](https://anelis-pfc3.atlassian.net/browse/SCRUM-24). Las relaciones padre, los puntos y los sprints se confirmaron mediante JQL; no se modificó Jira. Los antiguos HU del Excel son solo referencia de origen. [Backlog canónico](backlog.md): 16 historias, 74 SP planificados, dependencias, MoSCoW y criterios de aceptación.

Los cuatro sprints de Jira están en estado futuro y sus objetivos indican H0–H1, H1–H2, H2–H3 y H3–H4, **60 minutos cada uno**. [Informe](informe.md): Gantt relativo H0–H4 y burndown/velocidad proyectados etiquetados **SIMULACIÓN ACADÉMICA**. Flujo: To Do → In Progress → In Review → Done; WIP máximo 3 y 2. El avance proyectado no es historial Jira ni resultado real de desarrollo.

## Registro de evidencias y bloqueos

| Requisito | Evidencia | Estado |
|---|---|---|
| Rúbrica | PDF adjunto, páginas 1–3; transcripción anterior | Verificado |
| Backlog SCRUM | Consulta JQL de SCRUM-5 a SCRUM-24 | Leído; acceso del docente y capturas pendientes |
| Aplicación | 5 pruebas Node y build local | Parcial: falta prueba visual y criterios completos |
| Persistencia y permisos | `npm.cmd run verify:remote` contra el proyecto con configuración pública local y datos ficticios | POST 201 y GET correcto; PATCH 401 y DELETE 401 anónimos; GET final conservó `Pendiente`. La denegación se debe a privilegios revocados y RLS habilitado; no demuestra una política municipal ni identidades autenticadas. Reporte de prueba `cd161a4a-4ec7-4170-99f2-6abb18badbbb` permanece para revisión administrativa |
| GitHub Actions y PR | [Run 44669124034](https://github.com/ann0912/pfc3-examen/actions/runs/44669124034), commit `91ba5d0`, PR [#1](https://github.com/ann0912/pfc3-examen/pull/1) | Build, test y security correctos; deploy omitido en rama de trabajo; PR en borrador y sin conflictos al consultar |
| Vercel | `vercel.json` con despliegue automático Git desactivado; CLI previsto en Actions | Sin URL pública ni configuración de proyecto verificada; no pulsar Deploy inicial antes de controles aprobados |
| ZIP | `output/pfc3-examen-PC2.zip` generado con `git archive` | 38 entradas inspeccionadas; incluye código, documentos y workflow; excluye `.env.local`, dependencias y `dist`. Regenerar tras el último commit |
