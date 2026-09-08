# Reconocimiento, asistente, privacidad y resiliencia

Parte de la [especificación](especificacion.md). Límites propuestos de producto, no
garantías de exactitud de IA ni dictamen legal o médico.

## 1. Qué hace la IA y qué no

Usar un proveedor multimodal mediante OpenAI Responses API, configurable por modelo
y entorno. La API admite análisis de imágenes; sus resultados pueden ser incorrectos,
por lo que la publicación requiere confirmación humana.
Fuente: [OpenAI Docs: imágenes y visión](https://developers.openai.com/api/docs/guides/images-vision).

Definir `EquipmentRecognitionProvider` en `equipamiento/types.ts` y
`ExerciseAssistantProvider` en `asistente/types.ts`. Los servicios dependen de esas
interfaces; adaptadores intercambiables encapsulan SDK, tiempo de espera y errores.
La elección concreta del modelo se valida con fotos/preguntas de prueba, latencia,
cuenta disponible y presupuesto aprobado; no usar un alias «latest» sin evaluación.

Responsabilidades: proponer un tipo de equipo y aclaraciones; explicar contenido de
ejercicios revisados con contexto. Prohibido: publicar inventario, autoaprobar permisos,
modificar series/planes, generar ejercicios no catalogados o diagnosticar.
Generación de planes y sustitución funcionan sin llamar a un LLM.

## 2. Flujo de fotografías

1. Verificar sesión, titularidad del equipo personal o rol para el compartido y permiso
   de almacenamiento; compartir exige autorización aparte de visibilidad/revisión.
2. Pedir 1–4 fotos de una misma unidad: vista completa, ajustes/accesorios y etiqueta
   legible si existe. Evitar personas, documentos y datos identificables.
3. Aceptar JPEG, PNG y WebP hasta 5 MiB por foto tras normalizar; límite de 20 MiB por
   propuesta. Si el móvil entrega HEIC no soportado, pedir conversión o registro manual.
4. Subir directamente a un bucket privado en ruta con IDs de sede/equipo/autor/objeto;
   crear el objeto sin permiso para sobrescribir fotos de otros.
5. Validar MIME real, tamaño, decodificación y dimensiones en servidor; rechazar SVG,
   archivos corruptos, más de 20 megapíxeles o lados mayores de 10.000 px. Re-encode para eliminar EXIF/GPS.
   Solo la copia saneada se visualiza o envía al proveedor; borrar el original temporal.
6. Verificar consentimiento de envío a IA y recibir en reconocimiento únicamente
   IDs de fotos saneadas autorizadas. Subir manualmente no exige consentir IA.
7. Pedir salida estructurada: tipos candidatos del catálogo, atributos observados,
   atributos desconocidos, aclaraciones y estado `identified`/`needs_more_info`/`unknown`.
8. Validar esquema e IDs; presentar una propuesta editable, no inventario publicado.
9. El titular confirma el equipo para uso personal; para compartir se envía una copia
   a revisión del gestor/admin. La sede puede seguir pendiente mientras el titular entrena.

Fotos y resultados personales son accesibles solo al titular. Enviar a revisión copia
únicamente los objetos seleccionados a rutas nuevas con permisos independientes;
el revisor no obtiene acceso al original ni a otros recursos privados. Confirmar un
resultado de IA para uso personal no lo publica ni concede un rol de sede.

Fotos de varios aparatos deben separarse en propuestas; no contar automáticamente
unidades a partir de una panorámica. Una marca/modelo no legible queda desconocida.
Una etiqueta de confianza no es probabilidad calibrada ni habilita autopublicación.
Ejercicios compatibles se calculan con catálogo + atributos confirmados, no con una
lista inventada por el modelo. Siempre existe alta y corrección manual.

Storage debe aplicar límites y RLS; bucket privado y acceso autenticado o URLs firmadas
de corta duración. Subida directa evita pasar archivos por el body de Vercel Functions,
cuyo límite documentado es 4.5 MB. El endpoint solo intercambia metadatos pequeños.
Fuentes: [buckets de Supabase](https://supabase.com/docs/guides/storage/buckets/fundamentals),
[cargas estándar](https://supabase.com/docs/guides/storage/uploads/standard-uploads) y
[límites de Vercel Functions](https://vercel.com/docs/functions/limitations).

## 3. Validación de respuestas de IA

Solicitar JSON Schema estricto para el reconocimiento y validar también en servidor.
Structured Outputs aporta estructura, no demuestra que la identificación sea correcta;
contemplar rechazo de seguridad, salida incompleta y errores de transporte.
Fuente: [OpenAI Docs: Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs).

Rechazar IDs fuera del catálogo permitido, campos inesperados, cantidades inválidas,
atributos sin confirmar y respuestas que aparenten conceder permisos.
Tratar mensajes, nombres, texto OCR, etiquetas e instrucciones dentro de fotos como
datos no confiables; nunca como instrucciones de sistema. Sin ejecución de código,
SQL, URLs arbitrarias ni herramientas de escritura disparadas por el modelo.

## 4. Contexto del asistente

El navegador envía sesión, ejercicio de sesión, revisión esperada y pregunta. El
servidor comprueba ownership y construye el contexto desde servicios autorizados:

- Nombre, ID y versión del ejercicio/variante; instrucciones y fuentes revisadas.
- Equipo/configuración y fuente de la sesión; distinguir confirmado por titular de
  verificado por sede, sin ubicación personal ni dirección exacta.
- Prescripción de la rutina y progreso mínimo relevante del ejercicio actual.
- Nivel, preferencias o exclusiones relevantes; no peso, estatura o perfil completo por defecto.
- Historial reciente limitado de esa conversación, nunca mensajes de otros usuarios.

Máximo inicial: pregunta de 2.000 caracteres y 10 mensajes recientes; truncar contexto
de forma explícita sin perder ID/versión del ejercicio. Una conversación por sesión.
Mostrar contexto visible y un botón para cambiarlo deliberadamente si la pregunta
se refiere a otro ejercicio de la sesión. Fuera de sesión se pueden consultar fichas
estáticas; el chat contextual del MVP requiere una sesión activa.

Si el ejercicio cambia mientras llega una respuesta, conservarla etiquetada con su
contexto original o descartarla de la vista activa; nunca atribuirla al sustituto.
Tras sustitución, incrementar revisión de contexto antes de aceptar otra pregunta.
No almacenar ni renderizar HTML ejecutable del modelo. Referencias mostradas provienen
de IDs/URLs autorizados del catálogo; no inventar enlaces o citas.

## 5. Límites de seguridad de contenido

La app es una ayuda de entrenamiento, no un servicio de salud. No solicitar diagnósticos,
imágenes médicas ni historiales clínicos. No prometer resultados físicos garantizados.
Ante dolor o una preocupación de salud, no indicar continuar ni recomendar una carga
o tratamiento: pausar la orientación de ejercicio y sugerir ayuda profesional.
Situaciones de urgencia requieren un mensaje de búsqueda de atención inmediata,
sin atribuir un diagnóstico. Estas respuestas se prueban con casos de seguridad.

Los avisos no sustituyen controles: si falta información de una máquina, un ejercicio
está excluido o el contenido no fue revisado, no recomendarlo como opción segura.
La revisión profesional del catálogo y de las plantillas es condición del piloto real.

## 6. Privacidad y conservación

Minimizar datos y pedir consentimientos separados, con versión y fecha. Rechazar IA
no impide usar el inventario manual, las fichas ni el motor determinista.
Consentir IA no permite compartir medidas, planes o chats con usuarios/gestores.
Las fotos de inventario solo se comparten conforme a la autorización de visibilidad
separada; revisores de sede acceden a propuestas autorizadas para esa revisión.
No guardar ubicación continua; la sede elegida basta para este alcance.

| Datos | Política inicial propuesta |
| --- | --- |
| Perfil, medidas, planes e historial | Privados hasta que el titular los borre o elimine la cuenta. |
| Inventario personal y fotos confirmadas | Privados hasta retirada del titular o eliminación de cuenta; no son borradores abandonados. |
| Fotos originales de carga | Eliminar tras normalización; limpieza de huérfanas dentro de 24 horas. |
| Fotos rechazadas o borradores abandonados | Eliminar dentro de 30 días. |
| Fotos publicadas saneadas | Mientras el equipo y autorización estén vigentes; opción de retirarlas. |
| Chats y resultados de reconocimiento | 30 días; chats borrables por el titular antes. |
| Archivo de exportación | Privado y eliminado dentro de 24 horas. |
| Comprobante de eliminación | Estado no personal, expira y se elimina 24 h después de finalizar. |
| Logs técnicos sin contenido personal | 30 días; conservar solo métricas agregadas después. |
| Auditoría de roles/publicación | 90 días, sin datos corporales y con actor anonimizado al borrar cuenta. |

Son políticas de producto a confirmar antes de lanzamiento, no plazos impuestos por
una ley. Implementar limpieza programada idempotente, verificable y paginada, con
alertas si falla; no dejar la retención como texto sin mecanismo de cumplimiento.

Configurar llamadas a Responses con `store: false` y contexto gestionado por la app;
esto no equivale a retención cero del proveedor. Documentar el tratamiento vigente
y las excepciones antes de pedir consentimiento.
Fuente: [OpenAI Docs: controles de datos](https://developers.openai.com/api/docs/guides/your-data).

La exportación JSON debe incluir perfil, medidas, consentimientos, planes, resultados,
cambios, inventario personal, propuestas/reportes propios y chats retenidos, nunca datos de otros.
Avisar y pausar mutaciones durante la exportación; liberar la cuenta al terminar o
fallar, con recuperación de trabajos interrumpidos. Reautenticación para borrado,
confirmación explícita y estado de avance; preservar aportes compartidos anonimizados
y eliminar fotos personales conforme al [modelo de datos](modelo-datos.md).
Al revocar la sesión, un comprobante aleatorio cuyo hash guarda el servidor permite
consultar exclusivamente el estado del borrado; nunca descargar datos ni operar la cuenta.
La política debe explicar cuándo expiran copias de respaldo y sus límites: no prometer
borrado instantáneo de backups o de sistemas de terceros que no se controlan.

## 7. Coste, tiempos y fallos

Límites iniciales configurables: 10 reconocimientos y 50 preguntas por usuario/día;
una llamada de cada tipo en curso por usuario; tope global diario de gasto aprobado.
Reservar cuotas atómicamente en BD, limitar tokens de salida y registrar consumo sin
prompts/fotos en logs. Los reintentos nunca generan publicaciones ni mensajes duplicados.

Tiempo máximo propuesto: 30 s para reconocimiento y 20 s para respuesta de chat,
ajustado a los límites del despliegue; después mostrar fallo recuperable. Como máximo
un reintento automático de fallos transitorios dentro del tiempo y cuota restantes.
El SLA del proveedor no se supone; carga y modelo reales se miden antes de publicar.
No usar tareas en memoria de una Function esperando que sobrevivan a su terminación.

Si se agota la cuota o cae la IA: informar, ofrecer registro manual/ficha estática y
permitir seguir entrenando. Si falla guardar una serie: mostrar «pendiente/no guardado»
y reintentar por ID. Sin promesas de sincronización offline en el MVP.

## 8. Evaluación y criterios de salida

CI usa proveedores simulados y cubre respuesta válida, ambigua, desconocida, error,
timeout, cuota, prompt injection, ID inventado, foto ajena y contexto obsoleto.
Probar Storage/RLS con usuarios de sedes distintas y acceso por URL caducada.
Probar foto personal en sede pendiente, gestor sin acceso al original, copia autorizada
independiente y confirmación privada que no publica ni habilita inventario ajeno.
Probar limpieza, borrado con fallo a mitad y doble envío sin pérdida de datos ajenos.

Antes de habilitar IA con usuarios reales: conjunto consentido de al menos 30 casos
de máquinas/accesorios y 30 preguntas, incluyendo ambigüedad y salud. Registrar tasa
de candidatos correctos, solicitudes de aclaración, respuestas respaldadas, coste
y latencia. Revisor humano aprueba el resultado y se documentan fallos conocidos.
Ninguna publicación automática, filtración entre usuarios o respuesta que anime a
continuar ante dolor se acepta en esa evaluación. Cambiar modelo/prompt repite pruebas.
