# Etapa base: T00–T06

Estado: T00 validada localmente, con [entrega remota pendiente](../entregas/t00.md).
T01–T06 pendientes, no ejecutadas.
Aplicar el [contrato común de entrega](../tareas.md#contrato-común-de-entrega) en cada PR.
Referencias: [arquitectura](../arquitectura.md), [datos](../modelo-datos.md)
y [especificación](../especificacion.md).

## T00 Base Next.js, pruebas y CI

- Módulo/alcance: infraestructura local; Next.js App Router, TypeScript, Tailwind,
  Vitest, Testing Library, Playwright y CI reproducible; preparar integración local aislada.
- Depende de: ninguna tarea; confirmar el estado inicial del repositorio.
- Aceptación: pantalla inicial accesible; estructura por dominios; comandos `lint`,
  `test`, `build` y `test:e2e` documentados y ejecutables; lockfile versionado.
  Documentar integración local aislada; T01 incorpora `test:db` con pruebas reales,
  sin scripts vacíos que simulen éxito. CI ejecuta lo existente e informa fallos.
- Límites: no implementar auth, reglas de negocio ni módulos vacíos completos.
  No crear/modificar variables de entorno reales, secretos o ajustes remotos sin permiso.
  Documentar requisitos y nombres de configuración sin valores sensibles.
- Pruebas: unitaria del componente inicial; integración del entorno local de pruebas;
  E2E de carga inicial y navegación básica. Comprobar que un fallo se reporta correctamente.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t00-base-ci`. Indicar cualquier preparación remota aún no autorizada.

## T01 Autenticacion inicial

- Módulo/alcance: `auth`; registro, acceso, cierre de sesión y recuperación de acceso
  con Supabase Auth; identidad de sesión validada en servidor y roles globales protegidos.
- Depende de: T00 y permiso explícito para autenticación y configuración de entorno.
  Esta ficha no constituye ese permiso.
- Aceptación: errores comprensibles sin revelar si una cuenta existe; rutas privadas
  protegidas también en servidor; expiración y cierre de sesión invalidan el acceso.
  Redirecciones limitadas a destinos permitidos y flujo de recuperación verificable.
  `app_roles` no editable por el cliente; alta del primer administrador solo controlada
  y autorizada. Añadir `test:db` con Supabase local/pgTAP y RLS real al contrato y al CI.
  Crear `account_states`, guardia de cuenta y contratos protegidos de transición;
  comprobarlos en servidor/BD desde ahora, sin implementar todavía exportación/borrado.
- Límites: no roles de sede ni perfil de entrenamiento. Usar entorno y buzón de pruebas;
  no cambiar ajustes remotos ni proveedores fuera de lo autorizado.
- Pruebas: unitarias de validación y redirecciones; integración de sesiones y acceso
  no autenticado; E2E de registro, acceso, recuperación y cierre con correo de prueba.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t01-auth`, indicando el permiso recibido y la configuración necesaria.

## T02 Perfil de entrenamiento

- Módulo/alcance: `usuarios`; alta y edición del perfil privado de entrenamiento.
- Depende de: T01.
- Aceptación: recoger objetivo, experiencia, 1–6 días semanales, días elegidos,
  tiempo disponible, preferencias y exclusiones de movimientos según la especificación.
  Confirmar mayoría de edad, zona horaria y consentimientos separados; ofrecer solo
  objetivos/niveles previstos en la especificación; generar exige la plantilla revisada de T07.
  Estatura y peso opcionales, con unidades explícitas; no inferir cargas desde ellos.
  Validar número de días, duplicados y datos incompletos; explicar el uso de cada dato.
  El usuario puede revisar y corregir su perfil; ningún otro usuario puede leerlo.
- Límites: no diagnósticos, historia clínica, generación de rutinas ni cambios de auth.
- Pruebas: unitarias de normalización y validación, incluyendo campos opcionales;
  integración de propiedad/RLS con dos usuarios; E2E de onboarding y edición móvil.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t02-perfil` con datos sintéticos y sin exponer información sensible.

## T03 Busqueda y registro de sedes

- Módulo/alcance: `gimnasios`; búsqueda paginada, detalle, selección y propuesta de sede.
- Depende de: T01.
- Aceptación: identificar una sede por registro estable, nombre y dirección normalizada;
  mostrar posibles duplicados antes de proponer una nueva y gestionar carreras de alta.
  La propuesta queda pendiente hasta aprobación administrativa; no publicar automáticamente.
  Incluir servicio y vista mínima de aprobar/rechazar para administrador, antes del panel T15.
  Dos sedes de una cadena pueden coexistir. Buscar con dirección manual; GPS fuera del MVP.
  Registrar una sede no concede ningún rol ni permite editar inventario compartido.
  El titular de una propuesta pendiente puede seleccionarla para su inventario personal;
  ningún otro deportista adquiere acceso por ello. Aprobarla no verifica equipos ni cambia roles.
  Rechazo/fusión guarda resolución y destino canónico; los consumidores T08/T09 pedirán
  reasociación/regeneración confirmadas sin reescribir historial. T03 no implementa esos módulos.
- Límites: no reconocimiento de equipos ni configuración de servicios de mapas pagados.
- Pruebas: unitarias de búsquedas/normalización y candidatos duplicados; integración
  de paginación, titularidad, aprobación y fusión; E2E de localizar una sede existente,
  proponer otra y seleccionarla pendiente solo como su titular.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t03-sedes` con índices de búsqueda y límites de consulta comprobados.

## T04 Roles y permisos por sede

- Módulo/alcance: `gimnasios`; autorización de usuario, colaborador y gestor por sede;
  operaciones protegidas de asignación/revocación para un administrador autorizado.
- Depende de: T01 y T03. Documentar cómo se habilita el primer administrador con permiso.
- Aceptación: el administrador asigna y revoca roles con auditoría de actor, sede y cambio.
  No existe autoasignación por registro, dirección, GPS ni datos enviados por el cliente.
  El colaborador propone; el gestor valida en sus sedes; el usuario consulta lo confirmado.
  Un deportista puede crear inventario personal y enviar una copia a revisión sin rol;
  esto no lo asciende, no publica la copia y no expone el original privado.
  Los cambios de rol afectan operaciones posteriores sin confiar en estados antiguos de UI.
- Límites: no panel administrativo completo, no permisos para leer perfiles privados
  ni modificaciones de autenticación. El origen del rol global debe verificarse en servidor.
- Pruebas: unitarias de permisos de uso personal/envío sin privilegios, integración/RLS
  de escalada, revocación y aislamiento; E2E de asignar/revocar. El envío real se prueba en T06.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t04-roles-sede`, incluyendo intentos directos de API no autorizados.

## T05 Catalogo de ejercicios validado

- Módulo/alcance: `ejercicios`; catálogo versionado y consultable con ejercicios,
  músculos, movimientos, instrucciones, variantes y requisitos de equipo/accesorios.
- Depende de: T01 y revisión humana del contenido por un entrenador cualificado.
- Aceptación: cada ejercicio tiene ID estable, estado editorial y versión; separar
  músculos principales/secundarios y requisitos conjuntos de requisitos alternativos.
  Solo contenido validado resulta elegible. Conservar versiones usadas por planes.
  Catálogo paginado y filtros definidos; informar cuando falta contenido validado.
  Incluir equivalencias direccionales revisadas y su conversión de trabajo pendiente;
  los consumidores no deben inventarlas después para suplir un catálogo incompleto.
- Límites: no generador, reconocimiento ni autoría libre de ejercicios mediante IA.
  Series, repeticiones y otros parámetros no se presentan como prescripción universal.
- Pruebas: unitarias del esquema y combinaciones de requisitos; integración de estados,
  versionado y paginación; E2E de consulta de ficha, filtros y resultados vacíos.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t05-catalogo` con evidencia de revisión, o bloqueo si sigue pendiente.

## T06 Inventario manual compartido y personal

- Módulo/alcance: `equipamiento`; inventario compartido verificado e inventario personal
  provisional por sede; unidad física, tipo, accesorios y estado separados.
- Depende de: T03, T04 y T05.
- Aceptación: colaborador propone y gestor confirma; usuarios ven inventario confirmado
  de la sede elegida. Mantener dos unidades iguales como recursos distintos.
  En una sede propia pendiente, o una publicada con inventario insuficiente, cualquier
  deportista puede registrar recursos observados para sí. Debe elegir un tipo del catálogo
  revisado y confirmar manualmente presencia y accesorios; no preseleccionar un equipo genérico.
  El inventario `personal_confirmed` pertenece solo a su titular y nunca aparece a terceros.
  Puede enviar explícitamente una copia a revisión compartida sin obtener rol; el original
  permanece privado y la copia no se publica hasta validación de gestor o administrador.
  Una máquina multifunción habilita solo configuraciones/accesorios confirmados.
  Guardar revisión y autor de cambios; manejar edición concurrente sin pérdida silenciosa.
  Fuera de servicio excluye la unidad; retirar equipos no rompe referencias históricas.
- Límites: sin fotografías, ocupación global, promoción automática ni aprobación compartida
  por quien carece de rol. Confirmación personal no equivale a verificación compartida.
- Pruebas: unitarias de estados, fuente y requisitos; integración de RLS, copia explícita,
  concurrencia e historial; E2E de primer usuario en sede pendiente→inventario personal,
  acceso ajeno denegado, envío de copia sin publicación y validación compartida posterior.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t06-inventario` con consultas paginadas e índices correspondientes.
