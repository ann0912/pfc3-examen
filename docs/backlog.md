# Backlog canónico — proyecto SCRUM

Proyecto Jira comprobado en modo lectura: [SCRUM](https://anelis-pfc3.atlassian.net/jira/software/projects/SCRUM). Épicas SCRUM-5 a SCRUM-8 e historias SCRUM-9 a SCRUM-24, con padres, puntos y sprint, observadas mediante consulta JQL. No se modificó Jira. Los códigos HU del Excel se conservan solo como referencia de origen: HU-01 corresponde a SCRUM-9, y así sucesivamente hasta HU-16 = SCRUM-24.

Los 74 story points coinciden entre el backlog Excel y los campos consultados en SCRUM. Son estimaciones relativas Fibonacci, no horas. Las cuatro épicas siguen la estructura acordada:

| Épica documental | Nombre | Descripción y objetivo de negocio |
|---|---|---|
| SCRUM-5 | Registro de propietarios y mascotas | Cuenta y mascotas asociadas a un propietario responsable; facilitar identificación y tenencia responsable. |
| SCRUM-6 | Reportes ciudadanos de incidencias | Comunicar heces, orina, deterioro y animales sin supervisión; identificar focos de contaminación. |
| SCRUM-7 | Gestión municipal y fiscalización | Consultar, clasificar, asignar y atender incidencias con registro de inspección; mejorar respuesta municipal. |
| SCRUM-8 | Mapa y monitoreo de puntos críticos | Visualizar incidencias y estadísticas por zona; apoyar decisiones municipales. |

**Estado real:** ninguna historia de este backlog está demostrada de extremo a extremo. La web local cubre partes de SCRUM-13 y SCRUM-18: formulario anónimo de reportes, cuatro categorías, lista pública y filtro por distrito. No implementa las cuentas, ubicación en mapa, fotos, historial privado, roles, fiscalización, estadísticas ni notificaciones que exigen los criterios completos. Los estados de los cuatro sprints del informe son **SIMULACIÓN ACADÉMICA** y no equivalen a historias terminadas en el código o en Jira.

| ID | Épica | Historia / nombre canónico | SP | MoSCoW | Depende de | Sprint | Estado real |
|---|---|---|---:|---|---|---|---|
| SCRUM-9 | SCRUM-5 | Registro de ciudadanos | 5 | Must | — | S1 | Pendiente |
| SCRUM-10 | SCRUM-5 | Inicio de sesión | 3 | Must | SCRUM-9 | S1 | Pendiente |
| SCRUM-11 | SCRUM-5 | Registro de mascotas | 5 | Must | SCRUM-9, SCRUM-10 | S1 | Pendiente |
| SCRUM-12 | SCRUM-5 | Actualizar datos de mascotas | 3 | Should | SCRUM-11 | S1 | Pendiente |
| SCRUM-13 | SCRUM-6 | Registrar reporte de contaminación | 8 | Must | SCRUM-10 | S2 | Parcial local: falta sesión, código y estado «Recibido» |
| SCRUM-14 | SCRUM-6 | Ubicación geográfica del reporte | 5 | Must | SCRUM-13 | S2 | Pendiente: no hay mapa ni coordenadas |
| SCRUM-15 | SCRUM-6 | Adjuntar evidencia fotográfica | 3 | Should | SCRUM-13 | S2 | Pendiente |
| SCRUM-16 | SCRUM-6 | Consultar historial de reportes | 3 | Should | SCRUM-13 | S2 | Pendiente: lista pública no equivale a historial propio |
| SCRUM-17 | SCRUM-7 | Gestionar usuarios municipales | 5 | Must | SCRUM-10 | S3 | Pendiente |
| SCRUM-18 | SCRUM-7 | Consultar y filtrar reportes | 5 | Must | SCRUM-13 | S3 | Parcial local: filtro público por distrito; falta panel municipal y otros filtros |
| SCRUM-19 | SCRUM-7 | Asignar reportes a fiscalizadores | 3 | Must | SCRUM-17, SCRUM-18 | S3 | Pendiente |
| SCRUM-20 | SCRUM-7 | Registrar inspecciones municipales | 5 | Must | SCRUM-19 | S3 | Pendiente |
| SCRUM-21 | SCRUM-8 | Visualizar incidencias en el mapa | 5 | Should | SCRUM-14 | S4 | Pendiente |
| SCRUM-22 | SCRUM-8 | Panel de estadísticas municipales | 5 | Should | SCRUM-18 | S4 | Pendiente |
| SCRUM-23 | SCRUM-8 | Identificar zonas críticas | 8 | Could | SCRUM-21, SCRUM-22 | S4 | Pendiente |
| SCRUM-24 | SCRUM-8 | Notificaciones sobre reportes | 3 | Should | SCRUM-16, SCRUM-20 | S4 | Pendiente |

S1 = 16 SP; S2 = 19 SP; S3 = 18 SP; S4 = 21 SP; total = **74 SP**. No se creó ni modificó ninguna incidencia en SCRUM durante esta actualización documental.

## Criterios de aceptación de referencia

Cada enunciado es el alcance del Excel contrastado con la web. No se considera aceptado hasta demostrar ambos casos cuando se indiquen.

| ID | Dado / Cuando / Entonces |
|---|---|
| SCRUM-9 | Dado un visitante, cuando registra nombre, correo, teléfono, distrito y contraseña válidos, entonces se crea su cuenta. Dado un correo existente, cuando intenta repetirla, entonces ve un error. |
| SCRUM-10 | Dada una cuenta activa, cuando ingresa credenciales correctas, entonces accede. Dadas credenciales incorrectas, cuando intenta acceder, entonces ve un error. |
| SCRUM-11 | Dado un propietario autenticado, cuando completa nombre y especie de una mascota, entonces queda asociada a su cuenta. Si faltan campos obligatorios, entonces se informa qué completar. |
| SCRUM-12 | Dada una mascota propia, cuando el propietario edita sus datos, entonces se actualizan. Dada una mascota ajena, cuando intenta editarla, entonces se deniega el cambio. |
| SCRUM-13 | Dado un ciudadano autenticado, cuando indica tipo, descripción y ubicación, entonces se registra el reporte con código único y estado «Recibido». |
| SCRUM-14 | Dado un reporte nuevo, cuando el ciudadano selecciona el mapa, entonces se guardan coordenadas. Si no hay geolocalización, cuando ingresa dirección manual, entonces puede registrar el reporte. |
| SCRUM-15 | Dado un reporte, cuando adjunta una imagen permitida, entonces queda asociada. Si el archivo no es permitido, entonces ve un error. |
| SCRUM-16 | Dado un ciudadano autenticado, cuando abre sus reportes, entonces ve fecha, descripción y estado solo de los propios; no puede acceder a los ajenos. |
| SCRUM-17 | Dado un administrador, cuando crea un funcionario y asigna rol, entonces se aplican permisos. Dado un ciudadano, cuando intenta una función municipal, entonces se deniega. |
| SCRUM-18 | Dado un fiscalizador en el panel, cuando consulta reportes, entonces ve las incidencias; al filtrar por distrito, fecha, tipo o estado, entonces solo ve coincidencias. |
| SCRUM-19 | Dado un supervisor y un reporte pendiente, cuando lo asigna a un fiscalizador, entonces se registra el responsable y aparece en sus tareas. |
| SCRUM-20 | Dado un reporte asignado, cuando el fiscalizador registra inspección, entonces se guardan observaciones y acciones; al cerrar, entonces se conserva el historial de estado. |
| SCRUM-21 | Dado el mapa con reportes, cuando se abre, entonces muestra ubicaciones; al filtrar, entonces cambia los marcadores sin exponer datos personales. |
| SCRUM-22 | Dados reportes, cuando el administrador abre el panel, entonces ve conteos por distrito y tipo; al elegir período, entonces se actualizan. |
| SCRUM-23 | Dados reportes, cuando se consultan zonas críticas, entonces se ordenan por concentración; al elegir período, entonces se muestra recurrencia de ese intervalo. |
| SCRUM-24 | Dado un cambio de estado, cuando el ciudadano recibe una notificación, entonces puede abrir el reporte actualizado. |

## Definition of Done propuesta

Una historia llega a Done real solo con todos sus criterios Dado/Cuando/Entonces aprobados, prueba pertinente ejecutada, revisión de seguridad y permisos por rol cuando aplique, y evidencia del recorrido. Ningún Done de la simulación constituye evidencia de Done real.
