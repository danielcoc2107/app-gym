# Backlog de implementación

Estado: T00 implementada y validada localmente; publicación y comprobaciones remotas
en curso. [Detalle de entrega](entregas/t00.md). T01–T18 no ejecutadas.
Este documento no crea tareas en Codex, issues, ramas, commits ni pull requests.

## Cómo usarlo

Asignar una ficha por vez, respetando sus dependencias y el contrato de entrega.
Cada ficha corresponde a una rama `codex/tXX-descripcion` y un PR pequeño.
No iniciar varias fichas en un solo pedido ni aprovechar un PR para modificar otros módulos.
Las dependencias son PR previamente revisados y fusionados, no trabajos simultáneos asumidos.

Leer primero [la especificación](especificacion.md), [la arquitectura](arquitectura.md),
[el modelo de datos](modelo-datos.md), [las reglas de entrenamiento](reglas-entrenamiento.md)
y [las reglas de IA y seguridad](ia-seguridad.md).
Ante contradicciones o permisos pendientes, detener la tarea y pedir una decisión.

## Etapas e índice

| ID | Tarea | Ficha |
| --- | --- | --- |
| T00 | Base Next.js, pruebas y CI | [Base](tareas/base.md#t00-base-nextjs-pruebas-y-ci) |
| T01 | Autenticación inicial | [Base](tareas/base.md#t01-autenticacion-inicial) |
| T02 | Perfil de entrenamiento | [Base](tareas/base.md#t02-perfil-de-entrenamiento) |
| T03 | Búsqueda y registro de sedes | [Base](tareas/base.md#t03-busqueda-y-registro-de-sedes) |
| T04 | Roles y permisos por sede | [Base](tareas/base.md#t04-roles-y-permisos-por-sede) |
| T05 | Catálogo de ejercicios validado | [Base](tareas/base.md#t05-catalogo-de-ejercicios-validado) |
| T06 | Inventario manual compartido y personal | [Base](tareas/base.md#t06-inventario-manual-compartido-y-personal) |
| T07 | Motor puro de rutinas | [Entrenamiento](tareas/entrenamiento.md#t07-motor-puro-de-rutinas) |
| T08 | Persistencia y menú de planes | [Entrenamiento](tareas/entrenamiento.md#t08-persistencia-y-menu-de-planes) |
| T09 | Sesiones, series e historial | [Entrenamiento](tareas/entrenamiento.md#t09-sesiones-series-e-historial) |
| T10 | Sustituciones por equipo ocupado | [Entrenamiento](tareas/entrenamiento.md#t10-sustituciones-por-equipo-ocupado) |
| T11 | Fotografías privadas de equipos | [IA y cierre](tareas/ia-y-cierre.md#t11-fotografias-privadas-de-equipos) |
| T12 | Reconocimiento asistido de equipos | [IA y cierre](tareas/ia-y-cierre.md#t12-reconocimiento-asistido-de-equipos) |
| T13 | Contexto del asistente y ficha estática | [IA y cierre](tareas/ia-y-cierre.md#t13-contexto-del-asistente-y-ficha-estatica) |
| T14 | Chat de ayuda con IA | [IA y cierre](tareas/ia-y-cierre.md#t14-chat-de-ayuda-con-ia) |
| T15 | Incidencias y auditoría administrativa | [IA y cierre](tareas/ia-y-cierre.md#t15-incidencias-y-auditoria-administrativa) |
| T16 | Exportación de datos personales | [IA y cierre](tareas/ia-y-cierre.md#t16-exportacion-de-datos-personales) |
| T17 | Eliminación reanudable de cuenta y datos | [IA y cierre](tareas/ia-y-cierre.md#t17-eliminacion-reanudable-de-cuenta-y-datos) |
| T18 | QA y preparación de publicación | [IA y cierre](tareas/ia-y-cierre.md#t18-qa-y-preparacion-de-publicacion) |

T00–T10 permiten un piloto interno con inventario manual compartido o personal provisional.
Una sede pendiente no bloquea al titular: puede confirmar recursos para uso privado y entrenar.
Esto no publica equipos ni concede roles. No constituyen el MVP público.
Fotografías, reconocimiento y chat son requisitos del MVP final, aunque se implementen después.
La salida pública requiere también privacidad, eliminación, exportación y cierre de QA: T11–T18.
Calendario de clases, reservas, pagos, membresías y progresión avanzada quedan fuera.

## Contrato común de entrega

Este contrato forma parte de todas las fichas; no sustituye sus pruebas específicas.

1. Leer `AGENTS.md`, la ficha y sus documentos de referencia antes de modificar archivos.
2. Comprobar el estado de Git y preservar cambios ajenos. Trabajar en una rama `codex/...`,
   nunca directamente en `main`. Un PR abarca una ficha y su módulo propietario.
3. Implementar tipos, servicios, repositorio y UI solo cuando correspondan a la ficha.
   Consumir otros módulos por sus servicios públicos, sin importar sus repositorios.
   Cada módulo con datos personales incorpora sus contratos públicos de exportación
   y eliminación/anonimización, con pruebas, para la orquestación futura de T16/T17.
   Toda mutación y política/RPC respeta el estado de cuenta definido en T01; no esperar
   a T17 para añadir protección contra escrituras durante un borrado.
4. Crear pruebas unitarias para cada función de servicio y pruebas de integración para
   persistencia, permisos y restricciones nuevas. Incluir E2E de los recorridos afectados.
5. Antes de entregar, correr TODAS las pruebas del proyecto, no solo las afectadas,
   junto con lint y compilación. Los comandos obligatorios son:

   ```text
   npm run lint
   npm run test
   npm run test:db
   npm run build
   npm run test:e2e
   ```

6. T00 ejecuta los cuatro comandos sin BD; T01 añade `test:db` con integración real.
   Desde T01 se ejecutan los cinco comandos en cada entrega, sin excepciones por módulo.
   `test:db` ejecuta integración de base de datos, RLS y Storage cuando corresponda;
   `test:e2e` ejecuta toda la suite de Playwright. Usar datos sintéticos y un entorno
   local o de pruebas aislado. Nunca ejecutar pruebas destructivas sobre producción.
7. No silenciar, omitir ni rebajar pruebas o cobertura para conseguir un resultado verde.
   Corregir el código; modificar una prueba existente solo con autorización explícita.
   Si falta infraestructura, permiso o un comando, reportar el bloqueo, no afirmar aprobación.
8. Incorporar nuevas migraciones, índices y políticas junto a las tablas de la ficha.
   No modificar migraciones ya aplicadas. Paginar todas las listas que puedan crecer.
9. No editar autenticación, variables de entorno reales o configuración remota sin permiso.
   T01, T16 y T17 requieren autorización explícita antes de ejecutarse. No guardar secretos en Git.
10. Si los comandos fallan, corregir y repetirlos antes de abrir PR. La descripción del PR
    debe incluir alcance, capturas cuando proceda, pruebas y sus resultados, riesgos,
    permisos/migraciones y pasos precisos de revisión manual.
11. Comprobar el preview de Vercel en móvil y escritorio, sin errores nuevos de consola,
    y sin acceso a datos productivos. La conexión inicial de Vercel requiere autorización.
    Si no existe preview verificable, la entrega queda pendiente, no terminada.
12. El usuario revisa el enlace y da feedback en la misma tarea. Corregir ese alcance;
    fusionar únicamente después de su conformidad y de todas las verificaciones.

## Convenciones de las fichas

- `Depende de` identifica prerrequisitos técnicos; no elimina los permisos adicionales.
- `Aceptación` contiene condiciones observables, no promesas de implementación futura.
- `Pruebas` concreta unitarias, integración y E2E; siempre se añade la suite completa.
- Cada ficha debe informar qué se probó realmente y qué quedó bloqueado o sin ejecutar.
- Las cifras de ejercicios, series o repeticiones procederán de reglas y plantillas
  revisadas, no de valores inventados por el agente ni de una afirmación clínica.
- Un plan usa exactamente una fuente de inventario: `shared_verified` o
  `personal_confirmed`. No mezclar fuentes ni promover datos privados implícitamente.
