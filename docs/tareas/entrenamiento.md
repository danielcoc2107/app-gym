# Etapa de entrenamiento: T07–T10

Estado de todas las fichas: pendiente; no ejecutadas.
Aplicar el [contrato común de entrega](../tareas.md#contrato-común-de-entrega) en cada PR.
Leer [reglas de entrenamiento](../reglas-entrenamiento.md) y [modelo de datos](../modelo-datos.md).
Esta etapa permite el piloto interno, no la publicación del MVP completo.

## T07 Motor puro de rutinas

- Módulo/alcance: `rutinas`; funciones puras para producir propuestas semanales
  desde snapshots de perfil, catálogo, inventario y plantillas revisadas; sin IA ni red.
- Depende de: T02, T05 y T06; plantillas y fixtures revisados por entrenador cualificado.
- Aceptación: para cada disponibilidad de 1–6 días, devolver exactamente las sesiones
  solicitadas cuando sea viable, respetando duración, exclusiones y requisitos de equipo.
  La entrada identifica una sola fuente autorizada: inventario compartido publicado o
  inventario personal confirmado del titular; el motor no combina candidatos entre fuentes.
  Una sede pendiente propia admite únicamente `personal_confirmed`. Una sede publicada
  puede usar cualquiera de las dos fuentes, elegida por el usuario para ese plan.
  Evaluar cobertura semanal conforme a las reglas documentadas, no solo a los títulos.
  Cada grupo debe figurar como principal en algún ejercicio; secundarios no bastan.
  Resolver combinaciones de implementos y no usar unidades sin confirmar o fuera de servicio.
  Misma entrada, reglas, versiones y criterio de desempate producen el mismo resultado.
  Si se agotan las combinaciones admitidas sin solución, devolver `infeasible` no activable;
  si la búsqueda alcanza su límite sin concluir, devolver `search_incomplete`, no inviabilidad.
  Nunca inventar equipamiento, contenido ni cobertura. No relajar restricciones en silencio.
- Límites: no persistencia, UI, cambios de perfil, cargas derivadas de peso/estatura,
  prescripción clínica ni progresión automática avanzada.
- Pruebas: unitarias parametrizadas para 1–6 días, exclusiones, inventario vacío,
  fuentes personal/compartida sin mezcla, titularidad, requisitos AND/OR, empates
  y duración inviable; invariantes sobre fixtures revisados.
  Integración de contratos de entrada/salida sin proveedor externo; ejecutar E2E existente.
  No añadir una pantalla únicamente para probar este motor: su E2E propio corresponde a T08.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t07-motor-rutinas`. Si falta revisión de plantillas, declarar el bloqueo.

## T08 Persistencia y menu de planes

- Módulo/alcance: `rutinas`; orquestación por servicios públicos, guardado de versiones
  y menú semanal con detalle de ejercicios y motivos de selección.
- Depende de: T07.
- Aceptación: elegir sede y días, solicitar plan y guardar una versión privada solo después
  de validarla. Menú con una entrada por sesión; nombres comprensibles sin forzar divisiones
  por músculo si la disponibilidad requiere otro reparto. Mostrar cobertura y limitaciones.
  Solo un plan `complete` puede activarse, con confirmación; máximo uno activo por usuario.
  Guardar versiones de perfil, catálogo, inventario y reglas usadas; no reescribir planes
  históricos al cambiar datos actuales. Regenerar crea una versión nueva con confirmación.
  Detectar cambios relevantes del inventario entre generar y guardar; revalidar o informar.
  Evitar duplicados por reintentos/doble clic; paginar planes anteriores.
  Guardar `inventory_source` y snapshot de los recursos usados. Permitir generar con fuente
  personal en sede pendiente propia sin esperar gestor. Cambiar a inventario compartido crea
  una propuesta nueva: no mezcla fuentes ni reescribe el plan anterior.
  Aprobación de sede/equipo no migra planes. Rechazo o fusión de sede pide reasociar y
  regenerar con confirmación, preservando planes, sesiones e historial existentes.
- Límites: no asistente, sesiones registradas ni modificaciones en repositorios ajenos.
- Pruebas: unitarias de orquestación, versionado e idempotencia; integración de propiedad,
  consistencia y RLS; E2E de perfil+sede→generación→menú→detalle para 1–6 días con fixtures.
  Cubrir falta de cobertura, cambio de sede, reintento y acceso de otro usuario.
  E2E adicional: sede pendiente propia→inventario personal→plan activado; comparar planes
  personal/compartido y comprobar transición confirmada sin reescritura histórica.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t08-planes`, con preview revisable en móvil y escritorio.

## T09 Sesiones, series e historial

- Módulo/alcance: `entrenamientos`; iniciar, reanudar, finalizar o abandonar una sesión;
  registrar ejecución de ejercicios y series, y consultar historial privado paginado.
- Depende de: T08.
- Aceptación: solo una sesión `in_progress` por usuario; estados finales `completed`
  y `abandoned`. Revalidar recursos al iniciar/reanudar y comenzar otro ejercicio;
  preservar el snapshot y lo ya realizado. El usuario identifica el ejercicio actual
  y registra valores ejecutados con unidades explícitas y validaciones de producto.
  Doble clic o reintento no duplica series ni sesiones. Recargar recupera lo guardado;
  mostrar guardado pendiente/error sin dar por sincronizados datos que no lo están.
  Distinguir completado, omitido y pendiente; finalizar informa el estado real.
  Temporizador de descanso basado en timestamp persistido; recuperar su estado tras recarga.
  Cambiar el plan no modifica ejecuciones históricas; fechas y zona horaria coherentes.
  La sesión conserva fuente y recursos del snapshot. Aprobar sede/publicar copia no migra
  sesiones; rechazo/fusión pausa la continuación guiada, permite cerrar/abandonar y conserva resultados.
  En modo personal, reconfirmar presencia/operatividad al iniciar o reanudar.
  Separar cobertura planificada/real con series de trabajo y semana local documentadas.
- Límites: no funcionamiento offline completo, cargas sugeridas ni progresión avanzada.
- Pruebas: unitarias de transiciones, validaciones e idempotencia; integración de acceso
  privado, orden/paginación y guardado concurrente; E2E de iniciar→registrar→recargar→finalizar
  y consulta del historial, incluyendo fallo de red, sesión incompleta y transición de sede.
  E2E crítico: primer usuario sin gestor propone sede pendiente, confirma recursos personales,
  activa su plan e inicia/completa una sesión sin publicar inventario ni recibir un rol.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t09-sesiones`, con datos de prueba sin información de usuarios reales.

## T10 Sustituciones por equipo ocupado

- Módulo/alcance: `entrenamientos`; alternativas deterministas durante la sesión,
  usando reglas/catálogo y disponibilidad temporal de unidades para ese usuario.
- Depende de: T05, T06 y T09.
- Aceptación: marcar ocupada una unidad física excluye ese recurso en la sesión;
  otra unidad del mismo tipo sigue siendo elegible. Permitir deshacer la marca.
  Filtrar por restricciones del perfil, accesorios confirmados, sede y servicio;
  después ordenar equivalencias según reglas y explicar diferencias relevantes.
  Entregar hasta tres opciones; compartir un músculo no prueba equivalencia.
  Proponer antes de aplicar; sustituir únicamente al confirmar. Conservar original,
  sustituto, motivo y series ya registradas, sin modificar planes ni historiales previos.
  Revalidar exclusiones actuales y versión al confirmar; no transferir kilos entre variantes.
  Recalcular pendientes con la conversión revisada y todos los segmentos realizados;
  rechazar opciones sin conversión válida o que excedan volumen/duración de la plantilla.
  Si no hay alternativa válida, explicar y permitir posponer u omitir; no inventar opciones.
  Las marcas no representan ocupación global ni requieren Supabase Realtime.
  Buscar alternativas exclusivamente en la fuente del plan; nunca completar un inventario
  personal con recursos compartidos ni acceder a recursos personales de otro titular.
- Límites: no equivalencias creadas libremente por IA ni cambios de catálogo para forzar resultados.
- Pruebas: unitarias de equivalencia, restricciones, recursos AND/OR y dos unidades iguales;
  integración de historial, fuente única, dos sustituciones tras series completadas, aislamiento
  por sesión y revalidación antes de confirmar;
  E2E de ocupado→alternativas→confirmar→continuar, deshacer y ausencia de alternativas.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t10-sustituciones`, con casos reproducibles de cambio y conservación de registros.
