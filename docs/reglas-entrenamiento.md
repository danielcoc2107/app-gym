# Reglas del motor y del entrenamiento

Parte de la [especificación](especificacion.md). Reglas de producto, no prescripción médica.

## 1. Principio de generación

La rutina se genera con reglas deterministas y plantillas revisadas, no con texto
libre de un modelo. Un LLM puede explicar decisiones, pero no inventar ejercicios,
declarar equipos presentes ni decidir dosis, cargas o restricciones clínicas.

Entradas: objetivo soportado, nivel, días concretos, tiempo disponible, preferencias,
exclusiones, sede, fuente/inventario autorizado, catálogo y versión de plantilla.
El resultado contiene `status`, días, ejercicios, cobertura, duración estimada,
advertencias y revisiones de todas las entradas relevantes.

Cada plantilla define para su objetivo/nivel: patrones obligatorios, grupos objetivo,
rangos de series/repeticiones o tiempo, descansos, límites de volumen/duración,
criterios de recuperación entre días y reglas de prioridad. Todo parámetro debe
tener unidad, versión, responsable de revisión y prueba de límites.
La configuración inicial debe ser revisada por un profesional de entrenamiento
antes de usarla con personas; fixtures de software no constituyen esa validación.

## 2. Días y cobertura

Aceptar enteros de 1 a 6 y exactamente esa cantidad de días diferentes de la semana.
Rechazar 0, 7, fracciones o selecciones inconsistentes; no reducir días en silencio.
La distribución inicial propuesta es:

| Días | Plantilla orientativa |
| --- | --- |
| 1 | Cuerpo completo A; comprobar si cabe realmente en el tiempo disponible. |
| 2 | Cuerpo completo A/B. |
| 3 | Cuerpo completo A/B/C. |
| 4 | Torso/pierna A y torso/pierna B. |
| 5 | Torso, pierna, empuje, tirón y pierna. |
| 6 | Empuje/tirón/pierna A y B. |

Estos nombres describen organización, no prueban eficacia ni seguridad. La plantilla
validada determina si el calendario concreto es viable; si los días consecutivos
incumplen sus reglas, proponer otra distribución o pedir días distintos.

Conjunto inicial de grupos: pecho, espalda, hombros, bíceps, tríceps, cuádriceps,
isquiotibiales, glúteos, pantorrillas y zona media. El catálogo distingue músculos
principales y secundarios de cada variante.

Para evitar una promesa imprecisa, «cobertura» significa en este MVP que cada grupo
tiene al menos un ejercicio programado donde figura como principal. Los secundarios
se muestran como trabajo indirecto y no bastan para marcar cobertura completa.
Esta es una comprobación de presencia; no demuestra volumen suficiente, eficacia
ni ausencia de riesgo. La dosis se valida aparte con la plantilla profesional.

Un compuesto puede cubrir varios grupos principales si así figura en el catálogo
revisado. Las exclusiones siempre prevalecen: no quitarlas para colorear la cobertura.

## 3. Equipo realmente necesario

Cada variante tiene una o más configuraciones admitidas. Basta una configuración
completa (OR), pero dentro de ella deben existir todos los requisitos (AND), con
cantidad, atributos y accesorios compatibles.

Ejemplo: una configuración de press inclinado necesita banco ajustable Y un par de
mancuernas compatibles. Otra variante puede usar una máquina específica. Tener solo
el banco no habilita el ejercicio; una polea no implica que todos los agarres existan.

Cada unidad física tiene ID. Un par de mancuernas puede registrarse como un recurso
de tipo `par_mancuernas` con peso especificado; no inferir un par desde una unidad
suelta ni un rack completo desde su fotografía. Una máquina multifunción requiere
confirmar estaciones y accesorios; solo una configuración simultánea por recurso,
salvo capacidades verificadas explícitamente.

Cada plan elige `shared_verified` (compartidos publicados) o `personal_confirmed`
(personales confirmados por su titular); no mezcla fuentes. Ambos exigen recursos
operativos, de la sede del plan y con todos sus atributos necesarios confirmados.
El modo personal admite la sede pendiente propia sin gestor, según
[inventario provisional](inventario-provisional.md). «Fuera de servicio» es persistente;
«ocupado» es una exclusión temporal de una sesión.
Un ejercicio con peso corporal puede no requerir máquina, pero sí espacio, suelo
o soporte si su ficha lo exige; esos recursos también deben estar confirmados.

## 4. Algoritmo verificable

1. Validar identidad, perfil, objetivo, calendario, sede, fuente y revisiones.
2. Cargar catálogo/plantillas revisados y únicamente recursos autorizados de esa fuente.
3. Filtrar ejercicios por exclusiones, nivel permitido y requisitos completos.
4. Elegir la plantilla del número de días, objetivo y nivel.
5. Cubrir sus patrones/grupos con candidatos, respetando tiempo, volumen y recuperación.
6. Ordenar por ajuste a plantilla, preferencias y variedad; desempatar por ID estable.
7. Comprobar de nuevo cantidad de días, cobertura, duración y todas las restricciones.
8. Guardar borrador y explicación. Solo activar tras confirmación y revalidación.

La estimación de duración suma preparación, ejecución, descansos y transiciones con
valores de la plantilla. No basta contar ejercicios ni quitar descansos para encajar.
No repartir cargas de más días en uno solo sin recalcular sus límites.

Estado `complete`: cumplen todas las reglas, incluso con inventario personal confirmado;
no significa revisión administrativa. Estado `infeasible`: no existe solución
dentro de las plantillas admitidas y restricciones; devolver grupos faltantes, recursos ausentes, conflictos
de calendario o tiempo insuficiente y cambios posibles que el usuario pueda elegir.
Se puede mostrar un borrador parcial como diagnóstico, pero no activarlo ni etiquetarlo
como plan completo. Ningún caso requiere completar huecos con información inventada.

La búsqueda recorre las plantillas admitidas con límite de tiempo/nodos configurable.
`infeasible` solo afirma inviabilidad dentro de ese catálogo y plantillas tras agotar
sus combinaciones; no afirma que sea imposible entrenar de cualquier otra manera.
Si se agota el presupuesto sin concluir, devolver `search_incomplete`, permitir
reintentar y no activar un plan ni presentar el resultado como falta de equipo.

La generación es reproducible con mismas entradas y versiones. Si se introduce
variedad aleatoria más adelante, persistir una semilla y probar sus invariantes.
Peso y estatura no determinan kilos de trabajo; la carga inicial queda sin prescribir
y el usuario registra lo realizado. La progresión automática se deja fuera del MVP.

## 5. Versiones y cambios de plan

Un plan activo pertenece a un usuario, sede y fuente; como máximo uno activo por usuario.
Modificar perfil, días o sede crea una propuesta de nueva versión. No reescribir
sesiones terminadas, series completadas ni planes históricos.
Publicar la sede no cambia el origen personal del plan. Cambiar al inventario compartido
requiere regenerar y confirmar; rechazo/fusión exige resolver sede como indica el fallback.

Al iniciar/reanudar sesión y antes de comenzar el siguiente ejercicio, comprobar
inventario/catálogo vigentes. Equipo retirado
o ejercicio despublicado exige alternativa compatible o regeneración confirmada.
En sesión personal, el titular reconfirma presencia/operatividad al iniciar o reanudar;
editar características invalida la confirmación del recurso hasta confirmarlas otra vez.
Las nuevas exclusiones del usuario se aplican también a acciones futuras de una sesión
ya iniciada; se preserva la historia, pero no se sigue proponiendo algo ahora excluido.
Cambiar de sede requiere confirmar un nuevo plan; no usar IDs de equipos de otra sede.

## 6. Sesiones y series

Estados: `in_progress`, `completed`, `abandoned`. Una sesión activa por usuario.
Iniciar copia la versión de la rutina y sus prescripciones; cada ejercicio de sesión
tiene su ID y puede incluir segmentos original/sustituto para conservar series previas.
Registrar orden, repeticiones o segundos según variante, carga con unidad y estado.
Omitido no significa completado; repeticiones y tiempos no aceptan valores negativos.

Cada escritura lleva ID estable y versión esperada. Reintentar después de un fallo
no duplica series ni sesiones. Conflicto entre dos pestañas devuelve 409 y exige
recargar/conciliar; no sobrescribir automáticamente la versión más reciente.
El temporizador deriva de un timestamp persistido, no de que el navegador permanezca
activo. El historial muestra lo efectivamente realizado, no solo el plan original.

La cobertura realizada se calcula de lunes a domingo en la zona horaria de la sesión,
guardada al iniciarla. Un grupo cuenta si hay al menos una serie de trabajo completada
con reps/tiempo positivos en un ejercicio que lo tiene como principal. No cuentan
calentamientos ni series omitidas; sí lo ya completado en sesiones abandonadas.
Usar la fecha de realización de la serie; las sustituciones cuentan por su variante
real. Mostrar cobertura planificada y realizada por separado; ninguna mide por sí sola
dosis suficiente. Cambiar la zona horaria actual no reasigna el historial ya fechado.

## 7. Sustitución por equipo ocupado

1. El usuario selecciona el recurso ocupado; si hay dos unidades iguales, distinguirlas.
2. Guardar exclusión privada para la sesión; persiste hasta «ya está libre» o su cierre.
3. Filtrar por requisitos, exclusiones y nivel, usando solo la fuente de la sesión.
4. Buscar equivalencias revisadas con patrón de movimiento y objetivo principales
   compatibles; compartir un músculo por sí solo no es equivalencia suficiente.
5. Ordenar por cercanía de la equivalencia, viabilidad y preferencia; devolver 0–3 opciones.
6. Mostrar equipo requerido y diferencias de la opción. El usuario confirma.
7. Revalidar recursos, permisos y versión; guardar cambio y motivo en transacción.

Otra unidad libre del mismo equipo puede ser la primera opción. No mostrar como
disponible una unidad bloqueada en la sesión ni inferir ocupación global.
Conservar la prescripción pendiente solo si su regla de equivalencia lo permite;
si cambia modalidad/unidad, aplicar una conversión revisada que considere TODO lo
realizado en los segmentos anteriores y recalcule trabajo pendiente, volumen total
y duración. Sin conversión válida no ofrecer esa opción como sustituto. Nunca
transferir automáticamente kilos de una máquina a otra o a peso libre.

Las series realizadas permanecen vinculadas al ejercicio original; el sustituto
recibe únicamente lo pendiente. Actualizar de inmediato el contexto del asistente.
Si no hay equivalencia: ofrecer posponer, esperar u omitir con aviso de impacto en
cobertura real, sin sustituir por un ejercicio que incumpla restricciones.

## 8. Pruebas obligatorias del dominio

- Matriz 1–6 días, calendarios válidos/inválidos, duración límite y entrada incompleta.
- Mismas entradas/versiones producen mismo resultado; exactamente N rutinas.
- Cobertura planificada/real diferenciada, semana local y sesiones parciales/abandonadas.
- Inviabilidad probada dentro de plantillas vs. búsqueda interrumpida sin conclusión.
- Equipo inexistente, compartido sin publicar, personal ajeno/sin confirmar, averiado,
  con accesorio faltante o de otra sede excluido; no se mezclan fuentes.
- Sede pendiente propia sin gestor permite plan/sesión personales viables; inventario
  vacío o genérico no confirmado no habilita recursos; transición conserva historial.
- Configuraciones AND/OR y cantidades; dos máquinas iguales con solo una ocupada.
- Exclusiones y nivel jamás se relajan, ni al generar ni al sustituir.
- Inventario/perfil cambia entre propuesta y confirmación: revalidación o 409.
- Sustitución tras dos series y segunda sustitución: conservar historia, recalcular
  pendientes sin exceder la plantilla ni trasladar cargas entre variantes.
- Doble envío, dos pestañas, recarga, error de red y cierre idempotente de sesión.
- Cambiar de plan/sede no modifica historial; ausencia de alternativas no rompe la UI.
