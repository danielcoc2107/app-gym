# Modelo de datos y autorización

Parte de la [especificación](especificacion.md). Modelo lógico propuesto; no es una
migración ejecutada. Cada tarea agrega únicamente las tablas de su alcance.

## 1. Convenciones

Postgres, IDs UUID, timestamps `timestamptz` y fechas locales calculadas con la zona
horaria del perfil. Campos comunes: `id`, `created_at`, `updated_at`; `version` entero
para entidades editables. FK explícitas, valores positivos cuando corresponda y
estados limitados mediante constraints. Los JSON son tipados/versionados y validados;
no reemplazan relaciones necesarias para permisos o integridad.

Toda tabla expuesta requiere grants mínimos, RLS habilitado, políticas por operación
y pruebas positivas/negativas. Cada índice listado se implementa con la tabla; PK y
restricciones UNIQUE también crean índices. Indexar FK usadas en joins/filtros.

## 2. Identidad y perfil

| Tabla / dueño | Campos y relaciones esenciales | Índice mínimo adicional o unicidad |
| --- | --- | --- |
| `auth.users` / Supabase | Identidad gestionada por Auth; no duplicar contraseñas. | Administrado por proveedor. |
| `app_roles` / auth | `user_id → auth.users`, rol global `admin`; alta solo controlada. | UNIQUE `(user_id,role)`. |
| `account_states` / auth | `user_id`, estado activo/exportando/eliminando, versión; creado con la cuenta y solo alterable por coordinación autorizada. | PK `user_id`; `(status,updated_at)`. |
| `profiles` / usuarios | `user_id`, mayoría de edad confirmada, objetivo, experiencia, días, minutos, zona horaria, preferencias, exclusiones, versión. | PK `user_id`; no búsqueda pública. |
| `body_measurements` / usuarios | `user_id`, fecha, `height_cm?`, `weight_kg?`; valores opcionales. | `(user_id,recorded_at DESC,id)`. |
| `consents` / usuarios | `user_id`, propósito, versión del aviso, concedido/revocado, timestamp. | `(user_id,purpose,created_at DESC)`. |
| `account_jobs` / auth | `user_id` anulable al eliminar Auth, tipo exportación/borrado, estado, checkpoints, bloqueo temporal de proceso, hash de comprobante, objeto privado opcional, expiración, ID de petición. | `(user_id,created_at DESC,id)`; `(status,next_attempt_at,id)`; UNIQUE `(user_id,request_id)`. |

Perfil no incluye un campo de rol editable. La identidad/rol no se confía a
`user_metadata` que el propio usuario pueda cambiar. Desde T01 el estado de cuenta
se comprueba en el contexto verificado y en políticas/RPC de cada escritura. Exportar
pausa temporalmente mutaciones para obtener datos coherentes y libera la cuenta al
terminar o fallar; eliminar impide nuevas escrituras hasta completar el proceso.

## 3. Sedes e inventarios compartido y personal

| Tabla / dueño | Campos y relaciones esenciales | Índice mínimo adicional o unicidad |
| --- | --- | --- |
| `gym_sites` / gimnasios | Nombre, cadena opcional, país, ciudad, dirección normalizada, estado `pending/published/rejected/merged`, proponente, revisor, `canonical_site_id?`, versión. | `(status,city,normalized_name,id)`; `(city,normalized_address)`; `(proposer_id,status,id)`. |
| `site_access_requests` / gimnasios | `site_id`, solicitante, rol solicitado, motivo, estado, resolución. | `(site_id,status,created_at,id)` y `(user_id,created_at,id)`. |
| `site_roles` / gimnasios | `site_id`, `user_id`, rol colaborador/gestor, concedido por administrador. | UNIQUE `(site_id,user_id)` e índice `(user_id,site_id)`. |
| `site_equipment` / equipamiento | `site_id`, `scope`, `owner_user_id?`, `type_id?`, etiqueta, atributos/accesorios, `confirmation_status?`, `confirmed_by/at?`, `publication_status?`, operatividad, autor/revisor, versión. | `(site_id,scope,publication_status,type_id,id)`; `(owner_user_id,site_id,confirmation_status,id)`; unicidades parciales descritas abajo. |
| `equipment_submissions` / equipamiento | Autor, petición, `source_equipment_id?` privado, versión copiada, `shared_equipment_id`, autorización de fotos/campos. No se expone en catálogo. | UNIQUE `(actor_id,request_id)`; `(source_equipment_id,source_version)`; `(shared_equipment_id)`. |
| `equipment_photos` / equipamiento | `equipment_id`, autor, ruta privada, MIME/tamaño, estado de validación, fecha de eliminación prevista. | `(equipment_id,created_at,id)`; `(status,delete_after,id)`; UNIQUE `storage_path`. |
| `recognition_attempts` / equipamiento | `equipment_id`, actor, IDs de fotos, estado, candidatos saneados, modelo/prompt/esquema, coste agregado, petición. | `(equipment_id,created_at,id)`; UNIQUE `(actor_id,request_id)`. |

No imponer unicidad solo a una dirección: puede haber negocios distintos en el mismo
edificio. La búsqueda detecta posibles duplicados y el administrador decide; las
sedes conservan ID estable. El catálogo compartido se reutiliza; el fallback personal
es privado y se asocia a una sede publicada o a la propuesta pendiente de su dueño.
`merged` requiere destino publicado, distinto de origen; rechazar ciclos de fusión.

`scope`, `owner_user_id` y `site_id` son inmutables. `personal` exige dueño y confirmación
`draft/confirmed`, con publicación/revisor nulos; `shared` exige dueño/confirmación
personal nulos y publicación `draft/pending/published/rejected`. CHECK y RPC validan
esas combinaciones. Publicar requiere sede publicada y gestor/admin autorizado.
UNIQUE parcial `(site_id,unit_label)` para compartidos y `(site_id,owner_user_id,unit_label)`
para personales evita colisiones entre listas privadas. Envío explícito crea copia
compartida pendiente con nuevos IDs, no cambia el alcance del original ni concede rol.
El registro de envío permite reintentos sin duplicar y no da acceso al origen privado.

Equipo desconocido admite `type_id = null` en borrador. Confirmar uso personal o publicar
exige tipo y atributos mínimos; confirma el titular o revisa el gestor, respectivamente.
Editar campos relevantes invalida confirmación/publicación hasta nueva revisión válida.
`equipment_photos` y reconocimiento heredan el alcance de su equipo; una foto enviada
se copia a otro objeto Storage, sin revelar la ruta original. Dos máquinas iguales son dos
filas. Un par de mancuernas es un recurso explícito, no una cantidad inferida por IA.
Las configuraciones posibles de la unidad son atributos validados por el tipo; una
máquina multifunción no se convierte en múltiples unidades independientes sin comprobarlo.

## 4. Catálogo validado de ejercicios

| Tabla / dueño: ejercicios | Campos y relaciones esenciales | Índice mínimo adicional o unicidad |
| --- | --- | --- |
| `equipment_types` | Código, nombre, esquema de atributos y accesorios admitidos, estado y versión. | UNIQUE `code`; `(status,name,id)`. |
| `exercises` | Nombre base, descripción, estado de publicación. | `(status,name,id)`. |
| `exercise_variants` | `exercise_id`, nombre/variante, patrón, dificultad, modo reps/tiempo, instrucciones, advertencias, fuentes, revisor y versión. | `(exercise_id,status,id)`; `(status,movement_pattern,difficulty,id)`. |
| `variant_muscles` | `variant_id`, grupo muscular, principal/secundario. | UNIQUE `(variant_id,muscle_group)`; `(muscle_group,role,variant_id)`. |
| `equipment_configurations` | `variant_id`, nombre de configuración válida, versión. | `(variant_id,id)`. |
| `equipment_requirements` | `configuration_id`, `equipment_type_id`, cantidad, atributos/accesorios obligatorios. | `(configuration_id,equipment_type_id,id)`. |
| `exercise_equivalences` | `source_variant_id`, `target_variant_id`, motivo revisado, diferencias, regla de prescripción pendiente. | UNIQUE `(source_variant_id,target_variant_id)`; `(target_variant_id)`. |

Una variante tiene configuraciones alternativas (OR); cada configuración requiere
todos sus recursos (AND). Configuración sin requisitos significa peso corporal sin
soporte especial, solo si la ficha lo ha validado. La asignación verifica cantidades
sin reutilizar una misma unidad para dos requisitos incompatibles de la misma ejecución.
No asumir equivalencias simétricas: almacenar y validar cada dirección permitida.

La relación de inventario a variantes se calcula desde estos requisitos. No guardar
una lista de «todos los ejercicios de la máquina» producida libremente por IA.
Las relaciones muchos-a-muchos y FK son nativas del modelo relacional.
Fuente: [Supabase: joins y relaciones](https://supabase.com/docs/guides/database/joins-and-nesting).

## 5. Planes y entrenamiento real

| Tabla / dueño | Campos y relaciones esenciales | Índice mínimo adicional o unicidad |
| --- | --- | --- |
| `training_templates` / rutinas | Objetivo, nivel, días, reglas/dosis versionadas, revisor, estado. | UNIQUE `(template_key,version)`; `(status,goal,level,days)`. |
| `training_plans` / rutinas | `user_id`, `site_id`, `inventory_source`, estado, versión, petición idempotente, plantilla, IDs/versiones de recursos, snapshot y cobertura. | `(user_id,created_at DESC,id)`; UNIQUE `(user_id,request_id)`; UNIQUE parcial `user_id WHERE status='active'`. |
| `plan_days` / rutinas | `plan_id`, día de semana, posición, título y minutos estimados. | UNIQUE `(plan_id,weekday)` y `(plan_id,position)`. |
| `plan_exercises` / rutinas | `plan_day_id`, variante/configuración, posición, prescripción, snapshot de ficha y versión. | UNIQUE `(plan_day_id,position)`; `(variant_id)`. |
| `workout_sessions` / entrenamientos | `user_id`, `plan_day_id`, `site_id`, `inventory_source`, estado, zona horaria, inicio/fin/descanso, petición idempotente, revisión de contexto, snapshot de rutina/confirmación de recursos. | `(user_id,started_at DESC,id)`; UNIQUE `(user_id,request_id)`; UNIQUE parcial `user_id WHERE status='in_progress'`. |
| `session_exercises` / entrenamientos | `session_id`, origen en plan, variante/configuración, segmento, posición, estado, prescripción pendiente y snapshot. | `(session_id,position,segment)`; `(variant_id)`. |
| `set_logs` / entrenamientos | `session_exercise_id`, ordinal, tipo trabajo/calentamiento, reps/segundos, carga/unidad, estado, fecha de realización, versión e ID estable. | UNIQUE `(session_exercise_id,ordinal)`. |
| `session_blocked_equipment` / entrenamientos | `session_id`, `equipment_id`, marcado/liberado; nunca disponibilidad pública. | UNIQUE `(session_id,equipment_id)`. |
| `exercise_substitutions` / entrenamientos | `session_id`, ejercicio original/nuevo, recurso/motivo, snapshot de equivalencia, actor, petición. | `(session_id,created_at,id)`; UNIQUE `(session_id,request_id)`. |

Al sustituir se crea un segmento de ejercicio nuevo para series pendientes; los
`set_logs` anteriores no cambian de FK. El historial mantiene contenido y prescripción
de su momento aunque se actualice el catálogo. Despublicar contenido/equipos conserva
FK históricas; no hacer borrado en cascada del catálogo hacia entrenamientos.

RLS en hijos obtiene propietario desde su padre. Constraints y transacciones verifican
que sesión, plan, variante seleccionada y equipo pertenezcan al contexto correcto.
Una FK por sí sola no prueba sede, fuente ni propietario. `inventory_source` es
`shared_verified` o `personal_confirmed`, inmutable por versión del plan/sesión; validar
cada recurso según [la elegibilidad provisional](inventario-provisional.md).
Rechazo/fusión bloquea continuar/iniciar desde el contexto antiguo; no borra sus datos.

## 6. Asistente y operación

| Tabla / dueño | Campos y relaciones esenciales | Índice mínimo adicional o unicidad |
| --- | --- | --- |
| `assistant_threads` / asistente | `user_id`, `session_id`, estado. | `(user_id,created_at DESC,id)`; UNIQUE `(session_id)`. |
| `assistant_messages` / asistente | `thread_id`, ejercicio de sesión/revisión de contexto, rol, texto, referencias del catálogo, estado, petición. | `(thread_id,created_at,id)`; UNIQUE `(thread_id,request_id,role)`. |
| `content_reports` / admin | Actor, sede y recurso denunciado, categoría, mensaje limitado, estado, resolución. | `(status,created_at,id)`; `(actor_id,created_at,id)`. |
| `audit_events` / infraestructura | Actor, acción, recurso, sede opcional, timestamp y cambios no sensibles. | `(site_id,created_at,id)`; `(resource_type,resource_id,created_at,id)`. |
| `usage_counters` / infraestructura IA | Actor o cuota global, operación, ventana, reservado/consumido, expiración. | UNIQUE `(scope_key,operation,window_start)`. |

Auditoría append-only mediante triggers controlados; cliente no inserta ni cambia
eventos. Admin consulta auditoría sin datos corporales, prompts completos o secretos.
Cuotas se reservan en operación atómica de servidor y no dependen de memoria de una
Function. Índices de búsqueda adicional se justifican con consultas y mediciones.

## 7. Matriz de acceso a datos

| Recurso | Lectura | Escritura |
| --- | --- | --- |
| Perfil, medidas, consentimientos | Solo titular. | Solo titular; campos permitidos. |
| Planes, sesiones, series, bloqueos, chats | Solo titular mediante ownership del padre. | Titular a través del servicio; invariantes validadas. |
| Sedes, catálogo e inventario publicados | Usuarios autenticados. | Servicios del dominio con permisos de editor/gestor/admin correspondientes. |
| Sede pendiente | Proponente y administrador; consulta de detalle propia. | Proponente propone; administrador resuelve. |
| Equipo/fotos personales | Solo titular, sin bypass de gestor/admin. | Titular crea/edita/confirma; alcance/dueño/sede inmutables. |
| Propuestas compartidas y sus fotos sin publicar | Autor y revisores autorizados de esa sede. | Autor autorizado en borrador; publicación solo gestor/admin. |
| Copia enviada a revisión | Autor y revisores ven solo la copia y fotos seleccionadas. | Deportista crea mediante envío acotado; solo gestor/admin publica. |
| Fotos publicadas saneadas | Usuarios autenticados con acceso al inventario; URL temporal. | Gestor/admin; no sobrescribir objetos ajenos. |
| Roles globales/de sede | Usuario ve sus permisos; admin gestiona. | Solo operación administrativa validada; sin autoasignación. |
| Reportes/solicitudes de rol | Autor y revisores autorizados. | Autor crea; revisor resuelve; no cambia el autor. |
| Auditoría/cuotas | Admin para auditoría; usuario solo resumen propio de consumo. | Triggers/operación interna restringida. |
| Exportaciones | Solo titular, URL privada expirable. | Proceso de cuenta autorizado. |

«A través del servicio» no sustituye la protección de Postgres: revocar escrituras
directas que permitan saltarse invariantes y exponer RPCs acotadas cuando haga falta.
Aplicar `USING` y `WITH CHECK` y controles en Storage; probar JWT ausente, usuario A/B,
colaborador, gestor de otra sede y administrador. El administrador no recibe un bypass
general para leer información privada. Fuente: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 8. Eliminación y conservación

Eliminar cuenta borra datos privados y objetos asociados siguiendo un trabajo
reanudable: bloquear nuevas escrituras, revocar acceso, eliminar Storage/chat/historial,
planes/perfil y finalmente identidad. La auditoría conserva eventos no personales con
actor anonimizado. Borrar equipo/fotos personales y envíos pendientes; equipo compartido
publicado permanece sin autor personal. Borrar las fotos del usuario, tanto originales
como copias, salvo transferencia consentida. IDs de origen en envíos quedan nulos al borrar.
No permitir cascadas de `auth.users` que borren inventarios compartidos accidentalmente.

Los servicios de cada dueño exponen exportación/borrado autorizados a `auth` para esta
coordinación; ningún handler contiene el flujo de negocio. Los checkpoints permiten
reintentar fallos sin borrar datos ajenos ni perder tareas pendientes tras eliminar Auth.
Un proceso programado de servidor reclama trabajos por lotes con exclusión mutua,
ejecuta pasos acotados y reanuda fallos desde checkpoints. `account_jobs` conserva el
resultado sin FK personal tras eliminar Auth (`ON DELETE SET NULL`), solo hasta vencer
el comprobante temporal. No guardar payloads privados en el trabajo como copia oculta.
La política de retención y sus pruebas se detalla en [IA y seguridad](ia-seguridad.md).
