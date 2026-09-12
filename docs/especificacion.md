# Especificación técnica: asistente de entrenamiento para gimnasio

Versión: 1.1 propuesta · Fecha: 2026-09-06 · Estado actualizado: 2026-09-07.
Base T00 implementada y validada localmente; resto del producto pendiente.

## 1. Objetivo

Crear una aplicación web, cómoda de usar desde el celular, que construya un plan
semanal personalizado con los equipos del gimnasio elegido. Durante el entrenamiento
permitirá registrar avances, sustituir un ejercicio cuando su equipo esté ocupado y
consultar un asistente que conozca el ejercicio que se está realizando.

El inventario verificado pertenece a la sede y se comparte. Mientras falta o se revisa,
el usuario puede confirmar un inventario personal provisional. Las fotografías ayudan a identificar equipos,
pero nunca reemplazan la confirmación humana de sus características.

## 2. Documentos que forman esta especificación

| Documento | Contenido |
| --- | --- |
| [Arquitectura](arquitectura.md) | Stack, módulos, contratos, despliegue y pruebas. |
| [Modelo de datos](modelo-datos.md) | Entidades, relaciones, índices y permisos. |
| [Reglas de entrenamiento](reglas-entrenamiento.md) | Generación, cobertura, sesiones y sustituciones. |
| [Inventario provisional](inventario-provisional.md) | Entrenar en una sede nueva sin esperar un gestor; uso privado y paso a revisión. |
| [IA y seguridad](ia-seguridad.md) | Fotos, asistente, privacidad, límites y fallos. |
| [Tareas](tareas.md) | Trabajo dividido por módulo, dependencias y criterios de entrega. |
| [Reglas del repositorio](../AGENTS.md) | Instrucciones obligatorias para implementar. |

## 3. Alcance de la primera versión completa

Incluye cuenta personal; perfil; búsqueda y selección de sede; inventario compartido;
catálogo revisado de ejercicios; planes de 1 a 6 días; entrenamiento guiado con registro
de series; alternativas por equipo ocupado; registro de máquinas con fotos; asistente
contextual; roles y moderación mínimos; exportación y eliminación de datos propios.

La entrega se divide en dos etapas: primero un piloto interno con inventario manual y
entrenamiento; después fotos, asistente y cierre de seguridad/privacidad. Las fotos y
el asistente sí forman parte de la primera versión completa, no se descartan.

Fuera de alcance: pagos, membresías, facturación, reservas y calendario de clases,
dietas, rehabilitación, diagnóstico, análisis de postura por video, sensores de
ocupación, chat de voz, red social, aplicación nativa y funcionamiento completo sin
conexión. El calendario de días personales de entrenamiento sí está incluido.

## 4. Términos del producto

- **Sede:** lugar físico con identificador propio, dirección e inventario; dos sedes
  de una misma cadena no comparten automáticamente máquinas.
- **Equipo:** una unidad física o conjunto identificado, por ejemplo una máquina,
  una barra, un banco o un par de mancuernas con características conocidas.
- **Ejercicio/variante:** movimiento catalogado y su configuración concreta; por
  ejemplo, press inclinado con mancuernas y banco ajustable.
- **Plan:** distribución semanal de rutinas para un usuario y una sede.
- **Rutina:** ejercicios programados para uno de esos días; puede ser cuerpo completo.
- **Sesión:** ejecución real de una rutina, con series, cambios y resultados propios.

## 5. Usuarios y permisos

Toda persona registrada empieza como deportista. Los roles de colaborador y gestor
se conceden por sede; el administrador tiene un rol global protegido.

| Acción | Deportista | Colaborador de sede | Gestor de sede | Administrador |
| --- | --- | --- | --- | --- |
| Ver sedes e inventario publicado | Sí | Sí | Sí | Sí |
| Gestionar perfil, plan y sesión propios | Sí | Sí | Sí | Sí |
| Registrar/confirmar equipo y fotos personales | Solo propios | Solo propios | Solo propios | Solo propios |
| Proponer equipo/fotos para compartir | Copia de equipo propio | Solo su sede | Solo su sede | Sí |
| Confirmar/publicar inventario compartido | No | No | Solo su sede | Sí |
| Aprobar sedes y conceder/revocar roles | No | No | No | Sí |
| Leer medidas, rutinas o chats ajenos | No | No | No | No por defecto |

Un deportista puede solicitar un rol o avisar de un error. Dar una dirección,
seleccionar una sede o estar cerca de ella no concede edición del inventario compartido.
Registrar y confirmar recursos personales no requiere rol especial. El modo provisional
solo permite entrenar al titular y no concede privilegios sobre datos de la sede.
El primer administrador requiere alta controlada por el propietario del proyecto.

## 6. Perfil y personalización — RF-01

| Dato | Requisito y uso |
| --- | --- |
| Confirmación de mayoría de edad | Obligatoria; alcance inicial para adultos. |
| Objetivo | Acondicionamiento general o hipertrofia; solo opciones con plantilla revisada. |
| Experiencia | Principiante/intermedio; avanzado fuera del motor inicial. |
| Días por semana y días concretos | Entero de 1 a 6; la cantidad debe coincidir con la selección. |
| Tiempo disponible por sesión | Obligatorio; presupuesto de duración para el plan. |
| Estatura y peso | Se preguntan en cm/kg, pero pueden omitirse o borrarse. |
| Preferencias y exclusiones | Ejercicios o movimientos que el usuario no quiere realizar. |
| Sede activa | Se elige antes de generar; el plan queda asociado a esa sede. |
| Consentimientos | Privacidad y, por separado, envío de fotos/mensajes a IA. |

Peso y estatura sirven para seguimiento y contexto, no para inferir capacidad,
diagnosticar ni calcular automáticamente la carga de una máquina. No se exigen
perímetros, fotos corporales, sexo biológico ni un historial clínico para entrenar.
El perfil también guarda zona horaria para mostrar los días correctamente.

Aceptación: se puede completar el perfil sin medidas corporales, corregirlo después
y generar un plan con días, objetivo, nivel y duración. Las exclusiones son estrictas.

## 7. Funcionalidades y resultados observables

### RF-02 — Encontrar y reutilizar una sede

Buscar por nombre, ciudad y dirección, con resultados paginados. Mostrar dirección
y sede antes de confirmar. Si no existe, enviar propuesta de alta y comprobar
posibles duplicados. El proponente puede seleccionar su sede pendiente de inmediato
y usar el [inventario personal provisional](inventario-provisional.md). Otro usuario
ve el inventario compartido cuando la sede se publica; las listas personales son privadas.
GPS y búsqueda por cercanía quedan como mejora posterior, no requisito.

### RF-03 — Inventario manual y por fotografías

El deportista puede registrar equipo personal; el colaborador puede además proponer
equipo compartido. Se agrega manualmente o con 1–4 fotos, confirmando tipo, accesorios,
ajustes y unidades. El titular confirma su uso privado; el gestor/admin revisa y publica
el compartido. Una foto ambigua o borrador sin confirmar no habilita ejercicios.
Cada equipo muestra ejercicios compatibles con los recursos realmente confirmados.
El deportista puede enviar una copia explícita a revisión sin obtener un rol adicional.

### RF-04 — Generar y consultar el plan

Elegir una fuente: inventario compartido verificado o personal confirmado. Ambos
permiten activar planes viables; «personal» se muestra separado de «verificado por sede».
La ausencia de gestor no bloquea el modo personal. Generar tantas rutinas como días seleccionados y comprobar cobertura
semanal según [las reglas](reglas-entrenamiento.md). El menú presenta día, nombre,
grupos trabajados y duración estimada; cada ejercicio indica equipo, instrucciones,
series, repeticiones o tiempo y descansos de una plantilla revisada.

Los filtros por pecho, espalda, pierna, hombros, brazos y zona media permiten explorar
ejercicios; no obligan a dedicar un día exclusivo a cada músculo. Para tres días se
propone cuerpo completo A/B/C, no tres grupos aislados dejando el resto sin trabajar.

### RF-05 — Ejecutar una sesión y conservar el progreso

Iniciar la rutina elegida, consultar instrucciones, registrar series, repeticiones
y carga utilizada, descansar con temporizador y finalizar o abandonar. Guardar cada
cambio confirmado en servidor y recuperar la sesión al recargar. Un fallo de red
debe mostrar qué no se guardó, sin afirmar que quedó sincronizado.

### RF-06 — Sustitución inmediata

El botón «Equipo ocupado» permite marcar la unidad o recurso implicado y ofrece
hasta tres alternativas compatibles. El usuario acepta una, pospone u omite.
Nunca se modifican las series completadas ni se cambia toda la semana en silencio.
Si no hay alternativa válida, se explica; no se inventa equipo disponible.

### RF-07 — Asistente contextual

Dentro de una sesión, mostrar «Preguntando sobre: [ejercicio actual]». El asistente
recibe ese ejercicio, variante, equipo y contexto mínimo autorizado. Después de una
sustitución usa el nuevo ejercicio. Responde preguntas sobre ejecución y contenido
validado; no diagnostica ni prescribe tratamientos. Si falla la IA, siguen disponibles
la ficha del ejercicio y el registro del entrenamiento.

### RF-08 — Control y privacidad

Revisar propuestas y reportes, corregir información y auditar publicaciones y roles.
Cada usuario puede exportar sus datos y solicitar eliminación de cuenta. Ni el
inventario compartido ni el panel administrativo exponen medidas o conversaciones.

## 8. Navegación mínima

1. Acceso y creación de cuenta.
2. Configuración inicial del perfil y elección de sede.
3. Inicio: próxima rutina, sesión en curso y resumen semanal de cobertura.
4. Mi plan: días y detalle de ejercicios; confirmación de cambios de plan.
5. Entrenar: ejercicio actual, series, descanso, equipo ocupado y asistente.
6. Mi gimnasio: dirección, inventario, ficha y alta de equipos según permisos.
7. Historial y perfil: sesiones, medidas opcionales, preferencias y privacidad.
8. Revisión: propuestas, incidencias y permisos para roles autorizados.

Todas las pantallas tienen estados vacío, cargando, error y acceso denegado. Deben
funcionar con teclado, etiquetas accesibles y botones táctiles desde 360 px de ancho.

## 9. Supuestos y decisiones pendientes

Propuestas adoptadas para poder especificar: español, adultos, unidades métricas,
1–6 días, una sede/fuente de inventario por plan y ocupación privada de la sesión.
No representan aprobación del usuario de presupuesto, cuentas o configuración externa.

Antes del piloto real: aprobar las plantillas con un profesional de entrenamiento,
confirmar quién administra las sedes y aportar los accesos de prueba que correspondan.
Antes de integrar IA: acordar modelo, presupuesto y tratamiento de datos.
Antes del lanzamiento público: revisar privacidad según los países de operación y
validar recuperación/borrado de datos, permisos y pruebas en preview.

El repositorio inicialmente solo tenía `AGENTS.md`. Ahora dispone de la base T00,
dependencias y pruebas locales verificadas; consultar la [entrega T00](entregas/t00.md).
No hay servicios de Supabase, migraciones o despliegues remotos verificados.
