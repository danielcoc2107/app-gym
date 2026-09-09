# Arquitectura y entrega

Parte de la [especificación](especificacion.md). La base web y de pruebas T00 ya está
aplicada localmente; las demás integraciones siguen propuestas, sin configuración remota.

## 1. Stack elegido

| Capa | Elección | Motivo |
| --- | --- | --- |
| Web | Next.js App Router, React, TypeScript estricto, Tailwind CSS | Una aplicación responsive con cliente y servidor en el mismo repositorio. |
| Datos | Supabase Postgres | Relaciones entre sedes, equipos, variantes, planes y sesiones. |
| Identidad/archivos | Supabase Auth y Storage privado | Autenticación y acceso a archivos con políticas por usuario/sede. |
| Validación | Zod en límites de entrada y salida de IA | Contratos verificables en ejecución. |
| IA | OpenAI Responses API detrás de interfaces | Fotos y respuestas contextuales; no calcula la rutina base. |
| Hosting | Vercel, conexión al repositorio pendiente | Preview por PR una vez configurada la integración. |
| Pruebas | Vitest, Testing Library, Playwright y pruebas SQL de RLS | Reglas, UI, integración y aislamiento real de datos. |

Mantener Supabase en vez de cambiar a Firebase evita introducir otro modelo de datos
para relaciones claramente relacionales. No incorporar un backend separado, ORM,
microservicios, Redis, base vectorial ni WebSockets en el MVP.
Fijar versiones compatibles y un lockfile en T00, comprobando sus requisitos de Node;
esta especificación no congela una versión de librería sin haber creado el proyecto.

Server Components para lecturas iniciales; Client Components para formularios,
cámara y sesión interactiva. Los secretos no pasan al cliente.
Fuente: [Next.js: componentes de servidor y cliente](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## 2. Organización por dominio

```text
src/
  app/                    rutas, layouts y handlers delgados
  modules/
    auth/                 identidad, sesión y ciclo de vida de cuenta
    usuarios/             perfil, preferencias, medidas y consentimientos
    gimnasios/            sedes, propuestas y roles de sede
    ejercicios/           catálogo, requisitos y equivalencias revisadas
    equipamiento/         inventario, fotografías y reconocimiento
    rutinas/              plantillas, generación y planes versionados
    entrenamientos/       sesión, series y sustituciones
    asistente/            contexto y respuestas sobre ejercicios
    admin/                revisión y consulta de auditoría
  components/             UI genérica sin reglas de negocio
  lib/                    clientes técnicos, errores y utilidades genéricas
supabase/migrations/      migraciones nuevas, índices, constraints y RLS
supabase/tests/           pruebas SQL de permisos e integridad
tests/e2e/                flujos completos con datos sintéticos
```

Cada módulo tiene `components/`, `services/`, `repository.ts`, `types.ts` y `tests/`;
puede dividir su repositorio en archivos pequeños y añadir `providers/` para adaptadores.
Su contrato público se expone en `services/public.ts`, con los DTO que necesiten los
consumidores. No se importan componentes ni repositorios de otro módulo.

Lectura típica: ruta → servicio del módulo → repositorio → Supabase.
Una mutación valida sesión y entrada, autoriza en servicio y ejecuta una operación
atómica del repositorio; RLS vuelve a limitar el acceso en base de datos.
Los adaptadores de IA pertenecen al módulo que los utiliza, sin acceso directo a BD.

## 3. Dependencias y límites

- `gimnasios`, `usuarios` y `ejercicios` exponen datos propios; no dependen de rutinas.
- `equipamiento` consulta permisos públicos de `gimnasios` y compatibilidad de `ejercicios`.
- `rutinas` consulta perfil de `usuarios`, inventario de `equipamiento` y catálogo de `ejercicios`.
- `entrenamientos` consume planes de `rutinas` y contratos públicos de compatibilidad/inventario autorizado.
- `asistente` obtiene contexto autorizado de `entrenamientos`; no edita planes.
- `admin` llama a servicios de los módulos dueños para moderar; no salta sus permisos.
- `auth` coordina exportación/eliminación mediante servicios públicos de los dueños;
  estos reciben una identidad verificada y no importan `auth`, evitando ciclos.

El cliente técnico de autenticación puede vivir en `lib`; las decisiones de roles,
consentimiento y borrado son negocio y permanecen en sus módulos. La auditoría
transversal se escribe con triggers restringidos, no creando dependencias circulares.

## 4. Contratos principales de servidor

Los nombres son contratos de referencia; implementar cada familia en su tarea.
No crear todas las rutas ni migraciones en el PR de inicialización.

| Operación | Entrada esencial | Resultado |
| --- | --- | --- |
| `GET/PATCH /api/perfil` | Sesión verificada; campos permitidos y versión al editar | Perfil propio o conflicto de versión. |
| `GET /api/sedes` | Texto, ciudad, cursor, límite | Sedes publicadas paginadas. |
| `POST /api/sedes/propuestas` | Nombre y dirección normalizada | `site_id` pendiente, seleccionable por su autor, y posibles duplicados. |
| `POST /api/sedes/:id/roles` | Usuario y rol; solo administrador | Asignación auditada. |
| `GET/POST /api/sedes/:id/equipos` | Alcance `shared`/`personal`, cursor o campos válidos | Compartido permitido o recursos propios; owner derivado de sesión. |
| `POST /api/equipos/:id/confirmacion-personal` | Presencia/características y versión | Recurso propio confirmado para uso personal. |
| `POST /api/equipos/:id/propuesta-compartida` | Selección de campos/fotos, autorización, versión y petición | Copia pendiente de revisión; sin elevar rol ni publicar. |
| `POST /api/equipos/:id/publicacion` | Revisión humana y versión | Inventario publicado; solo gestor/admin. |
| `POST /api/equipos/:id/fotos` | Tipo/tamaño; permiso de carga | Destino autorizado de Storage. |
| `POST /api/equipos/:id/reconocimiento` | IDs de fotos validadas y consentimiento | Candidatos o petición de más información. |
| `POST /api/planes/generar` | Sede, `inventory_source` y revisiones de perfil/inventario | Borrador con procedencia y viabilidad; personal admite sede pendiente propia. |
| `POST /api/planes/:id/activar` | Versión esperada | Nueva versión activa sin borrar historia. |
| `POST /api/sesiones` | Día del plan; clave de idempotencia | Sesión propia o la ya existente. |
| `PUT /api/sesiones/:id/series/:serieId` | Resultados y versión | Serie persistida una sola vez. |
| `POST /api/sesiones/:id/alternativas` | Ejercicio, recursos ocupados y versión | Hasta tres opciones y diferencias. |
| `POST /api/sesiones/:id/sustituciones` | Opción elegida y versión esperada | Sustitución atómica, previa revalidación. |
| `POST /api/asistente/mensajes` | Sesión, ejercicio de sesión, mensaje, versión | Respuesta asociada al contexto solicitado. |
| `POST /api/cuenta/exportaciones` | Confirmación del titular | Solicitud de archivo privado. |
| `DELETE /api/cuenta` | Reautenticación y confirmación explícita | Solicitud reanudable de eliminación. |

Añadir consultas de detalle/historial y cierre de sesión en las tareas de su dueño.
La identidad siempre proviene de la sesión, no de un `user_id` enviado por el navegador.
Desde T01, Auth entrega al handler el actor verificado y estado de cuenta; cada
servicio recibe solo los campos que usa y RLS/RPC impide escribir en cuentas bloqueadas.
Éxito: `{ data, meta? }`; error: `{ error: { code, message, fieldErrors? }, requestId }`.
Usar 401 sin sesión, 403 sin permiso de acción, 404 para recursos ajenos privados,
409 para versiones/conflictos, 422 para entrada inviable, 429 para cuota y 503 para
dependencia caída. Nunca devolver SQL, secretos ni errores internos del proveedor.

Listas: cursor estable por `(created_at,id)` o clave de orden específica, 20 resultados
por defecto y máximo 50. La generación pagina el catálogo internamente o usa una
consulta acotada por plantilla: no recorta silenciosamente alternativas necesarias.
En selección/activación/sustitución revalidar revisiones para evitar datos obsoletos.
`equipamiento` resuelve una sola fuente autorizada por plan: `shared_verified` o
`personal_confirmed`. Los contratos devuelven origen, confirmación y versiones; nunca
unir listas privadas ajenas ni depender de un rol de sede para confirmar recursos propios.
Aplicar las transiciones de [inventario provisional](inventario-provisional.md).

## 5. Datos y seguridad de ejecución

Usar cliente Supabase vinculado a la sesión en operaciones normales. Las claves
secretas/elevadas nunca llegan al navegador ni se usan para eludir RLS de usuarios.
Políticas y permisos son parte de cada tabla nueva, incluyendo Storage.
Fuente: [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

Operaciones multitabla atómicas mediante transacción/RPC invocada solo desde el
repositorio dueño. Preferir funciones con privilegios del invocador; cualquier función
elevada requiere permisos mínimos, validación del actor y `search_path` fijo.
Las fotos se suben directamente a Storage; los handlers reciben metadatos/IDs.

## 6. Entornos y despliegue

- Local: Supabase local o proyecto de desarrollo, con datos sintéticos.
- CI: base efímera/local recreada desde migraciones; nunca producción.
- Preview: Vercel Preview y Supabase de pruebas separado; seeds idempotentes.
- Producción: proyecto Supabase y secretos propios; solo código revisado de `main`.

Un preview web no aísla su base de datos automáticamente: configurar variables
distintas por entorno. Si varios PR cambian esquemas incompatibles, serializar las
pruebas o habilitar una rama/BD de prueba por PR, no aplicar todo a una BD compartida.
Fuentes: [entornos Vercel](https://vercel.com/docs/deployments/environments) y
[ramas de Supabase](https://supabase.com/docs/guides/deployment/branching).

Documentar nombres de variables sin valores reales: URL y clave publicable de
Supabase, secretos exclusivos de servidor, configuración de modelos y cuotas de IA.
No crear ni editar archivos de entorno ni ajustes de Auth sin autorización explícita.
Callbacks de Auth deben permitir el entorno aprobado; no abrir comodines arbitrarios.
Las migraciones ya aplicadas son inmutables: correcciones mediante migración nueva.

## 7. Pruebas y puerta de calidad

Scripts desde T00: `lint` → `eslint . --max-warnings=0`;
`test` → `vitest run --coverage` sin modo watch;
`build` → `next build`; `test:e2e` → `playwright test` contra build de producción.
`test:db` se añade en T01 usando Supabase CLI/pgTAP y debe probar políticas reales.
`test:watch` puede existir solo para desarrollo. No confundir build con lint: Next.js
lo documenta por separado. Fuente: [instalación de Next.js](https://nextjs.org/docs/app/getting-started/installation).

En cada tarea ejecutar toda la suite existente: lint, unitarias, BD cuando exista,
build y E2E. Si falta un servicio o credencial, registrar el bloqueo: no declarar
pruebas exitosas, desactivarlas ni abrir un PR listo para merge con checks fallidos.
En Windows PowerShell 5 ejecutar los comandos por separado, deteniéndose ante error.

Vitest cubre servicios, filtros, generador y componentes síncronos; Playwright cubre
Server Components asíncronos y flujos completos. Las APIs de IA se simulan en CI;
su evaluación real es una prueba acotada y autorizada antes del piloto.
Fuente: [pruebas Vitest en Next.js](https://nextjs.org/docs/app/guides/testing/vitest).

## 8. Operación y aceptación técnica

Objetivos a medir, no garantías del proveedor: p95 de sustitución menor a 2 segundos
y generación menor a 3 segundos con 100 sesiones concurrentes, catálogo de 500
variantes y 300 recursos por sede. La IA tiene límites separados y no bloquea guardar
series. Registrar entorno, latencias, errores y coste agregado sin contenido personal.

Exigir build/lint/tests verdes, pruebas de permisos y cero errores de consola en los
flujos críticos del preview en móvil y escritorio. Proteger `main` con checks y revisión
una vez autorizado; no hacer merge automáticamente. El usuario prueba el enlace,
reporta pantalla/pasos/problema y la corrección se realiza en la misma rama/tarea.
