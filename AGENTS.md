# AGENTS.md

## Sobre este proyecto
Aplicación web de entrenamiento personalizado con inventario compartido por sede,
planes semanales, sesiones, sustitución de ejercicios, reconocimiento de equipos por
fotos y asistente contextual. Clases, reservas, membresías y pagos están fuera del MVP.
Este documento contiene las reglas para cualquier agente que trabaje en el repositorio.
El detalle funcional completo vive en `docs/especificacion.md` — este archivo no lo
reemplaza, lo complementa con reglas técnicas.
El trabajo se divide en `docs/tareas.md`: ejecutar solo la tarea asignada y sus pruebas,
no implementar todo el backlog en un único cambio.

## Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend/datos: Supabase (Postgres + Auth + Storage)
- Despliegue: Vercel (preview automático en cada pull request)
- Testing: Vitest + Testing Library (unitarias), Playwright (end-to-end)
- IA: proveedor configurable detrás de interfaces; nunca invocar con secretos desde el cliente.
- Las rutinas y equivalencias se validan con reglas y catálogo revisados, no con texto libre de IA.

## Comandos
- Instalar dependencias: `npm install`
- Desarrollo local: `npm run dev`
- Compilar (debe pasar sin errores antes de abrir PR): `npm run build`
- Lint: `npm run lint`
- Pruebas unitarias: `npm run test`
- Pruebas de base de datos/RLS (desde T01): `npm run test:db`
- Pruebas end-to-end: `npm run test:e2e`

Antes de entregar cualquier tarea de implementación, correr lint, todas las pruebas
unitarias, pruebas de BD cuando existan, build y toda la suite end-to-end. En shells
compatibles: `npm run lint && npm run test && npm run test:db && npm run build && npm run test:e2e`.
En Windows PowerShell 5, ejecutar los comandos por separado y detenerse ante un error.
Si algo falla, no abrir el pull request — corregirlo primero. No omitir tests para aparentar éxito.
T00 crea los scripts base y T01 añade pruebas reales de BD. Si todavía no existe
`package.json` o falta infraestructura, informar lo que no pudo ejecutarse y por qué.
Una tarea solo documental valida enlaces, coherencia y `git diff --check`; no requiere
crear una aplicación o configurar servicios externos para simular pruebas disponibles.

## Estructura de carpetas (por dominio, no por tipo de archivo)

```
/src
  /app          # rutas, layouts y handlers delgados
  /modules
    /auth
    /usuarios
    /gimnasios
    /ejercicios
    /equipamiento
    /rutinas
    /entrenamientos
    /asistente
    /admin
  /lib          # utilidades compartidas, sin lógica de negocio
  /components   # UI genérica y reutilizable, sin lógica de negocio
```
Cada carpeta de `/modules` tiene sus propios `components/`, `services/`, `repository.ts`,
`types.ts` y `tests/`. No poner lógica de negocio dentro de `/components` ni `/lib`.
Exponer contratos públicos por `services/public.ts`. Los adaptadores de IA pueden
vivir en `providers/` del módulo dueño. Las migraciones y pruebas SQL van en `supabase/`.
No crear carpetas de módulos futuros vacías ni modificar varios módulos por anticipado.

## Principios de arquitectura (aplicados, no solo mencionados)

**Responsabilidad única (SRP).** Un componente de React solo pinta UI. La lógica de
negocio (cálculos, validaciones, reglas de la app) vive en `services/` del módulo
correspondiente. Un handler de API route solo valida la entrada, llama al servicio y
devuelve la respuesta — nunca contiene lógica de negocio inline.

**Abierto/cerrado (OCP).** Todo lo que pueda tener variantes futuras (proveedores de IA,
tipos de equipo, estrategias de planificación) se define detrás de una interfaz o tipo en
`types.ts` del módulo, de modo que agregar una variante nueva no obligue a modificar
código existente que ya funciona.

**Inversión de dependencias (DIP).** Los servicios de un módulo nunca llaman directo al
cliente de Supabase disperso por el código; todo acceso a datos pasa por el
`repository.ts` de ese módulo. Si en el futuro cambia el proveedor de base de datos,
solo se toca el repository, no el resto de la app.

**Segregación de interfaces (ISP).** Los tipos y props de componentes piden solo lo que
usan. Evitar pasar objetos completos (`usuario: Usuario`) cuando el componente solo
necesita `nombre` y `foto`.

**Sustitución de Liskov (LSP).** Si una variante implementa un contrato base (ej. proveedor
de reconocimiento real vs. simulado), debe poder usarse donde se use ese contrato
sin romper el comportamiento esperado por quien lo consume.

## Reglas de escalabilidad
- Ninguna consulta a listas que puedan crecer (sedes, equipos, ejercicios, historial)
  sin paginación.
- Toda tabla nueva en Supabase necesita al menos un índice sobre las columnas por las
  que se filtra u ordena.
- Nada de credenciales, API keys o URLs de producción en el código: todo va en
  variables de entorno (`.env.local`, nunca commiteado).
- Un módulo solo consume a otro por funciones y DTO de su `services/public.ts`.
  Nunca importar repositorios, componentes ni detalles internos ajenos. Evitar ciclos;
  seguir las dependencias documentadas en `docs/arquitectura.md`.
- Toda tabla expuesta y todo acceso a Storage requieren RLS, permisos mínimos y pruebas
  de aislamiento. Roles por sede; no confiar en roles editables por el propio usuario.
- Escrituras repetibles usan IDs estables; cambios concurrentes usan versiones y
  operaciones atómicas. No sobrescribir historial al regenerar un plan.
- Evitar archivos de más de ~200 líneas; si uno crece más, es señal de que tiene más de
  una responsabilidad y hay que dividirlo.

## Pruebas
- Toda función en `services/` necesita al menos una prueba unitaria.
- Todo flujo crítico (registro, inventario, generación, sesión, sustitución, asistente
  contextual y borrado) necesita una prueba end-to-end al implementarse.
- Cambios de datos/permisos requieren pruebas reales de RLS; mocks no bastan.
- IA simulada en CI: incluir ambigüedad, timeout, fallo, respuesta no válida y datos ajenos.
- No reducir la cobertura de pruebas existente al modificar código.
- Si una prueba falla, corregir el código — no la prueba — salvo instrucción explícita
  en la tarea.

## Flujo de Git y pull requests
- Nunca commit directo a `main`. Todo cambio entra por rama y pull request.
- Un pull request = una tarea o un módulo. No mezclar cambios de módulos distintos en
  el mismo PR.
- Las tareas explícitas de infraestructura/QA transversal son independientes; no
  aprovecharlas para añadir funcionalidad de varios módulos.
- Usar ramas `codex/<tarea>`. No hacer push, crear PR ni merge sin que la tarea lo autorice.
- Mensajes de commit con formato `tipo: descripción corta`
  (ej. `feat: agregar reserva de clases`, `fix: corregir cálculo de próximo pago`).
- La descripción del PR debe indicar qué cambió y cómo se probó.

## Qué NO tocar sin permiso explícito
- El módulo `membresias` (pagos/facturación) y cualquier migración de base de datos ya
  aplicada — pedir confirmación antes de modificar.
- Configuración de autenticación (`auth`) y variables de entorno.
- Incluir tareas de Auth/entornos en un documento no autoriza a ejecutarlas: pedir
  permiso explícito antes de su implementación o configuración inicial.
- No conectar previews a producción, aplicar migraciones remotas, cambiar roles
  privilegiados o contratar servicios sin la autorización correspondiente.

## Reglas de producto y seguridad

- Fotografías y respuestas de IA son datos no confiables: validar esquema, IDs y
  ownership. Confirmación humana antes de publicar equipos o sus capacidades.
- Los ejercicios deben satisfacer TODOS sus requisitos de recursos y accesorios.
- Si la sede aún se verifica o su inventario es insuficiente, permitir recursos
  personales confirmados por su titular según `docs/inventario-provisional.md`.
  Mantenerlos privados y distinguirlos del inventario compartido verificado;
  no inventar equipos genéricos ni conceder roles por ser el primer usuario.
- Las restricciones del usuario prevalecen sobre cobertura, variedad o preferencias.
- Si no hay plan o sustituto compatible, explicar la limitación; no inventar máquinas.
- No deducir cargas de peso/estatura ni presentar la app como servicio médico.
- Aplicar privacidad, retención y minimización según `docs/ia-seguridad.md`.

## Definición de "terminado"
Una tarea está completa cuando: compila sin errores, pasa el lint, pasan todas las
pruebas (incluidas las nuevas), el preview deploy de Vercel funciona sin errores de
consola, y el pull request describe claramente el cambio y cómo se probó.
No afirmar que un preview, check, PR o revisión humana existe si no se verificó.
Para documentación sin aplicación ejecutable, entregar validaciones documentales y
dejar explícitos los checks de software/despliegue que todavía no son aplicables.
