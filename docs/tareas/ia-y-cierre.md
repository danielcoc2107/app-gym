# Etapa de IA, privacidad y cierre: T11–T18

Estado de todas las fichas: pendiente; no ejecutadas.
Aplicar el [contrato común de entrega](../tareas.md#contrato-común-de-entrega) en cada PR.
Referencias: [IA y seguridad](../ia-seguridad.md), [datos](../modelo-datos.md)
y [especificación](../especificacion.md). Esta etapa es obligatoria para el MVP público.

## T11 Fotografias privadas de equipos

- Módulo/alcance: `equipamiento`; captura/subida de fotos para un recurso personal o
  una propuesta compartida, con almacenamiento privado, permisos y conservación definidos.
- Depende de: T02, T04 y T06; configuración de Storage de pruebas autorizada si requiere cambios.
- Aceptación: admitir 1–4 fotos de hasta 5 MiB cada una; validar formato y contenido;
  retirar metadatos de ubicación y avisar que no incluya personas/documentos.
  Usar acceso temporal y privado; aprobar inventario no convierte el bucket en público.
  Solo fotos saneadas y aprobadas como visibles se muestran a usuarios autenticados.
  Una foto personal solo es visible para su titular. Enviar a revisión crea una copia
  explícita con permisos propios; el gestor no obtiene acceso al original y nada se publica
  hasta su revisión. El titular puede usar su recurso confirmado sin esperar esa revisión.
  Separar autorización de almacenamiento/visibilidad del consentimiento de IA de T12.
  Eliminar huérfanas/borradores vencidos con limpieza programada idempotente, ofrecer
  retirada y reintentar sin duplicar; la configuración del programador requiere permiso.
- Pruebas: unitarias de validación y retención; integración de Storage, RLS y enlaces
  temporales; E2E de foto personal en sede pendiente, copia para revisión, publicación
  separada, archivo inválido y acceso denegado a foto personal ajena.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t11-fotos-privadas`, sin enviar todavía imágenes a proveedores de IA.

## T12 Reconocimiento asistido de equipos

- Módulo/alcance: `equipamiento`; adaptador de visión detrás de interfaz y propuesta
  estructurada de tipo/accesorios a partir de fotos, con confirmación humana obligatoria.
- Depende de: T05 y T11; proveedor y tratamiento de imágenes revisados y autorizados.
- Aceptación: informar del envío al proveedor; responder con candidatos del catálogo,
  estado ambiguo o petición de otra foto. No inventar accesorios ni ejercicios.
  El equipo personal obtiene `confirmation_status = confirmed` y es elegible para fuente
  `personal_confirmed` cuando su titular confirma tipo, presencia y accesorios. Un gestor/admin revisa
  la copia compartida; ni la IA ni la confirmación del titular publican automáticamente.
  Aplicar límites de uso/coste, timeout, validación de salida y tratamiento seguro de texto
  en imágenes; fallo del proveedor conserva la alternativa de registro manual.
  Purgar resultados según retención y exponer consulta operativa minimizada para T15.
- Pruebas: unitarias de esquema, catálogo y estados; integración con proveedor simulado,
  respuestas malformadas, cuotas, origen y permisos; E2E de IA→confirmación del titular→uso
  personal, copia→revisión del gestor→publicación, ambigüedad, foto ajena y fallback manual.
  Sin consumo pagado automático en CI.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t12-reconocimiento`, con evaluación separada sobre imágenes consentidas.

## T13 Contexto del asistente y ficha estatica

- Módulo/alcance: `asistente`; contexto mínimo obtenido por servicios propietarios
  y ficha de ayuda del ejercicio actual con contenido validado, sin proveedor de IA.
- Depende de: T05, T09 y T10.
- Aceptación: mostrar ejercicio/variante y sesión usados; incluir solo datos necesarios
  del usuario autenticado. Tras una sustitución, actualizar contexto y ficha antes de responder.
  Versionar o identificar el contexto para impedir respuestas asociadas a un ejercicio anterior.
  Rechazar sesiones ajenas o inexistentes; la ficha funciona aunque posteriormente falle el chat.
- Límites: sin diagnósticos, datos médicos, llamadas externas ni acceso directo a repositorios ajenos.
- Pruebas: unitarias de selección/minimización e invalidación; integración de propiedad
  y contratos entre servicios; E2E ficha actual→sustitución→ficha nueva y acceso denegado.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t13-contexto-asistente` con snapshots sintéticos, sin datos personales en logs.

## T14 Chat de ayuda con IA

- Módulo/alcance: `asistente`; preguntas sobre ejercicio actual con adaptador de modelo,
  contexto de T13, límites de uso y respuesta segura; historial privado según retención definida.
- Depende de: T13; proveedor, costes, privacidad y configuración autorizados.
- Aceptación: mantener contexto visible, validar su vigencia al enviar y mostrar respuestas;
  permitir cancelar o descartar respuestas obsoletas al cambiar de ejercicio.
  Anclar explicaciones en fichas validadas; reconocer incertidumbre, no diagnosticar,
  no recomendar continuar ante dolor ni ejecutar instrucciones incrustadas en datos.
  Timeout/cuota/error muestran fallback estático; el chat no bloquea registrar entrenamiento.
  No exponer claves, razonamiento interno, perfiles ajenos ni información innecesaria al proveedor.
  Implementar limpieza de chats vencidos y métricas operativas sin texto para T15.
- Pruebas: unitarias de contexto, cuotas y salidas; integración simulada con errores,
  aislamiento y ataques de instrucciones; E2E pregunta contextual, cambio de ejercicio,
  seguridad y fallback. Evaluación humana documentada, sin inferir calidad desde mocks.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t14-chat-ia`, con resultados de evaluación y límites conocidos.

## T15 Incidencias y auditoria administrativa

- Módulo/alcance: `admin`; panel paginado de incidencias operativas y auditoría;
  consume servicios públicos de los módulos dueños para consultar y ejecutar acciones permitidas.
- Depende de: T04, T12 y T14.
- Aceptación: administrador autorizado puede investigar cambios de roles/inventario,
  propuestas ambiguas y fallos técnicos sin acceder a perfiles privados, medidas,
  exclusiones de entrenamiento ni contenido sensible del chat.
  Distinguir acciones permitidas y registrar actor, motivo, objeto y resultado;
  logs minimizados, filtros paginados y errores sin secretos. Nadie modifica la auditoría desde UI.
- Límites: no acceso directo a repositorios ajenos, panel médico ni poderes administrativos
  implícitos sobre todos los datos. Los servicios propietarios conservan sus autorizaciones.
- Pruebas: unitarias de presentación/redacción; integración de servicios y permisos;
  E2E de incidencia→acción autorizada→auditoría y acceso rechazado para usuario normal.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t15-admin`, sin implementar funciones de otros módulos que falten.

## T16 Exportacion de datos personales

- Módulo/alcance: `auth`; servicio orquestador de exportación por cuenta usando los
  contratos públicos de datos personales de cada módulo; archivos privados y temporales.
- Depende de: T02, T08, T09, T11, T12, T14 y T15; contratos propietarios disponibles.
  Requiere permiso explícito antes de modificar `auth` o configuración de entorno.
- Aceptación: exportar solo datos propios en formato documentado y legible por máquina;
  incluir perfil, planes, sesiones y datos personales conservados de fotos/chat según política.
  Incluir inventarios personales, sus fuentes y fotos privadas; distinguir las copias
  enviadas a revisión sin incorporar datos de otros revisores o usuarios.
  Conservar referencias útiles a aportes compartidos sin exportar datos privados de terceros.
  Verificar titularidad y autenticación reciente; limitar tamaño/uso, paginar extracciones
  y expirar descargas. Informar exportación completa o error; no entregar un archivo truncado como éxito.
  La composición se realiza en servidor con puertos de exportación, sin ciclos entre módulos.
  Procesar `account_jobs` persistidos por lotes reanudables; programador autorizado,
  exclusión mutua y reintentos acotados, no procesos en memoria de una Function.
  Avisar del bloqueo temporal de mutaciones y liberar estado de cuenta al finalizar
  o fallar; probar también recuperación tras una caída a mitad del proceso.
- Pruebas: unitarias de manifiesto y orquestación; integración multiusuario, paginación,
  expiración y fallos parciales; E2E solicitar→descargar→validar contenido y acceso ajeno denegado.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t16-exportacion`, sin ampliar este PR para construir módulos faltantes.

## T17 Eliminacion reanudable de cuenta y datos

- Módulo/alcance: `auth`; orquestación reanudable e idempotente de eliminación,
  mediante contratos de los servicios propietarios y registro mínimo del proceso.
- Depende de: T16 y permiso explícito para `auth`, entorno y operaciones requeridas.
  La eliminación solo se ensaya con cuentas sintéticas en entorno aislado.
- Aceptación: confirmar intención y autenticación reciente; bloquear nuevas escrituras
  de la cuenta en eliminación, revocar acceso y retirar perfil, planes, sesiones,
  fotos/chat personales y archivos de exportación según política documentada.
  Borrar inventario/fotos personales; anonimizar o tratar conforme a política las copias
  ya enviadas y aportes compartidos, sin borrar inventario publicado usado por otros.
  Registrar pasos, reintentos y fallos sin conservar datos eliminados innecesariamente;
  reanudar tras caída sin duplicar efectos y borrar la identidad en el orden seguro definido.
  Dar un comprobante temporal que solo permita consultar el estado tras cerrar la sesión.
  Explicar plazos, tratamiento de copias de respaldo y límites de proveedores externos;
  no afirmar eliminación instantánea de aquello que el sistema no controla.
- Pruebas: unitarias de máquina de estados/idempotencia; integración de interrupción
  tras cada paso, Storage, aislamiento y cuentas eliminadas; E2E confirmar→proceso→fin,
  reintento, borrado personal/de copias pendientes y conservación de equipo compartido
  publicado sin datos personales. Prohibido usar producción.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t17-eliminacion`, con evidencia de permisos y pruebas de reanudación.

## T18 QA y preparacion de publicacion

- Módulo/alcance: calidad transversal; pruebas, documentación operativa y configuración
  revisada de release. No implementar aquí pendientes funcionales de varios módulos.
- Depende de: T00–T17 aceptadas; accesos/configuración de preview autorizados.
- Aceptación: ejecutar recorrido móvil/escritorio de registro→perfil→sede→inventario
  con fotos→reconocimiento confirmado→plan→sesión→sustitución→pregunta contextual;
  incluir un primer usuario sin gestor: propone sede, confirma inventario personal,
  genera plan y completa sesión. Verificar que no publica, no gana rol y otro usuario no ve
  recursos/fotos; luego enviar copia, revisarla y publicar con un gestor autorizado.
  Probar por separado `personal_confirmed` y `shared_verified`, sin mezcla, y el cambio
  confirmado tras aprobación/rechazo/fusión sin reescribir planes, sesiones o historial.
  Comprobar también exportación/eliminación, aislamiento entre usuarios/sedes y recuperación
  ante fallos de IA. Revisar accesibilidad, estados vacíos, carga, errores y consola.
  Revisar presupuestos/límites, políticas de conservación, backups y rollback documentado;
  no ejecutar cambios de producción ni publicar sin autorización del usuario.
  Defectos funcionales vuelven a la tarea y al módulo propietario, en PR separados.
- Pruebas: revisar unitarias y cobertura sin rebajarla; ejecutar integración completa
  con RLS/Storage y toda la suite E2E, además de QA manual y evaluación humana de IA.
  Registrar comandos, resultados, entorno, revisión de contenido y URL real del preview.
- Entrega: correr TODAS las pruebas del proyecto y los comandos del contrato común;
  un PR `codex/t18-qa-release`. El usuario prueba y aprueba antes de fusionar/publicar;
  sin fotos, chat, privacidad o QA completos, el resultado sigue siendo piloto interno.
