# PFC III

Al recibir el caso, lee el enunciado y la rúbrica primero. Usa CLASES.md y los
PDF de Scrum, Arquitectura, DevOps, Software Testing y DevSecOps para el
criterio del curso, y los demás materiales para las preguntas pertinentes.
El PDF titulado Principios de Economía muestra GamarraYa tras la portada.
Úsalo como referencia de evidencia, sin trasladar su dominio, historias ni tablas.

1. Extrae requisitos, puntos de la rúbrica, criterios de aceptación y evidencias
   en docs/entrega.md. Identifica primero el flujo funcional mínimo.
2. Define actores y casos de uso. Dibuja arquitectura lógica y física con los
   componentes y entornos que se implementen. Aplica la skill de frontend al
   implementar pantallas.
3. Usa Jira para el objetivo del sprint, backlog, historias y criterios Dado /
   Cuando / Entonces. Alinea las pruebas con la Definition of Done. Vincula las
   claves reales del tablero con ramas y PR cuando esté disponible.
4. Decide relacional frente a NoSQL según relaciones, consultas y consistencia.
   Si corresponde PostgreSQL, modela cardinalidades, PK, FK y restricciones.
   Versiona migraciones en supabase/migrations. Si hay roles, revisa permisos
   y RLS y verifica su comportamiento con identidades de prueba.
5. Usa Git para cambios y GitHub para PR y comprobaciones. Conserva los checks
   iniciales e integra instalación reproducible, lint, tipos, pruebas y build
   según el stack. Configura detección de secretos y revisión de dependencias.
   Añade análisis estático si lo exige el caso. Usa permisos mínimos y registra
   qué controles se ejecutaron en CI, su resultado y cómo afectan el merge.
6. Verifica el recorrido principal con datos ficticios y pruebas pertinentes.
   Despliega una versión compilable en Vercel y confirma que el flujo funciona
   desde el enlace. Si se usa Supabase, confirma la persistencia al recargar.
   Registra qué checks o integraciones quedan pendientes.
7. Prepara una sustentación breve con el requisito, implementación, prueba y
   enlace correspondiente, y comprueba el formato final de entrega.
