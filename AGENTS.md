# AGENTS.md

## Sobre este proyecto
Aplicación web de gestión de gimnasio: usuarios (clientes, entrenadores, administradores),
rutinas de entrenamiento, calendario de clases, membresías y pagos. Este documento son las
reglas que debe seguir cualquier agente (Codex u otro) al trabajar en este repositorio.
El detalle funcional completo vive en `docs/especificacion.md` — este archivo no lo
reemplaza, lo complementa con reglas técnicas.

## Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS
- Backend/datos: Supabase (Postgres + Auth + Storage)
- Despliegue: Vercel (preview automático en cada pull request)
- Testing: Vitest + Testing Library (unitarias), Playwright (end-to-end)

## Comandos
- Instalar dependencias: `npm install`
- Desarrollo local: `npm run dev`
- Compilar (debe pasar sin errores antes de abrir PR): `npm run build`
- Lint: `npm run lint`
- Pruebas unitarias: `npm run test`
- Pruebas end-to-end: `npm run test:e2e`

Antes de entregar cualquier tarea, correr:
`npm run lint && npm run test && npm run build`
Si algo falla, no abrir el pull request — corregirlo primero.

## Estructura de carpetas (por dominio, no por tipo de archivo)
```
/src
  /modules
    /auth
    /usuarios
    /rutinas
    /clases
    /membresias      # incluye pagos y facturación
    /admin
  /lib          # utilidades compartidas, sin lógica de negocio
  /components   # UI genérica y reutilizable, sin lógica de negocio
```
Cada carpeta de `/modules` tiene sus propios `components/`, `services/`, `repository.ts`,
`types.ts` y `tests/`. No poner lógica de negocio dentro de `/components` ni `/lib`.

## Principios de arquitectura (aplicados, no solo mencionados)

**Responsabilidad única (SRP).** Un componente de React solo pinta UI. La lógica de
negocio (cálculos, validaciones, reglas de la app) vive en `services/` del módulo
correspondiente. Un handler de API route solo valida la entrada, llama al servicio y
devuelve la respuesta — nunca contiene lógica de negocio inline.

**Abierto/cerrado (OCP).** Todo lo que pueda tener variantes futuras (métodos de pago,
tipos de membresía, tipos de clase) se define detrás de una interfaz o tipo en
`types.ts` del módulo, de modo que agregar una variante nueva no obligue a modificar
código existente que ya funciona.

**Inversión de dependencias (DIP).** Los servicios de un módulo nunca llaman directo al
cliente de Supabase disperso por el código; todo acceso a datos pasa por el
`repository.ts` de ese módulo. Si en el futuro cambia el proveedor de base de datos,
solo se toca el repository, no el resto de la app.

**Segregación de interfaces (ISP).** Los tipos y props de componentes piden solo lo que
usan. Evitar pasar objetos completos (`usuario: Usuario`) cuando el componente solo
necesita `nombre` y `foto`.

**Sustitución de Liskov (LSP).** Si una variante extiende un tipo base (ej. clase
presencial vs. virtual), debe poder usarse en cualquier lugar donde se use el tipo base
sin romper el comportamiento esperado por quien lo consume.

## Reglas de escalabilidad
- Ninguna consulta a listas que puedan crecer (usuarios, clases, historial de pagos)
  sin paginación.
- Toda tabla nueva en Supabase necesita al menos un índice sobre las columnas por las
  que se filtra u ordena.
- Nada de credenciales, API keys o URLs de producción en el código: todo va en
  variables de entorno (`.env.local`, nunca commiteado).
- Los módulos (`auth`, `usuarios`, `rutinas`, `clases`, `membresias`, `admin`) no se
  importan directamente entre sí. Si un módulo necesita datos de otro, lo pide a través
  de una función expuesta en el `service` del módulo dueño de esos datos — nunca
  accediendo directo a su `repository`.
- Evitar archivos de más de ~200 líneas; si uno crece más, es señal de que tiene más de
  una responsabilidad y hay que dividirlo.

## Pruebas
- Toda función en `services/` necesita al menos una prueba unitaria.
- Todo flujo crítico (registro, pago, reserva de clase) necesita una prueba end-to-end.
- No reducir la cobertura de pruebas existente al modificar código.
- Si una prueba falla, corregir el código — no la prueba — salvo instrucción explícita
  en la tarea.

## Flujo de Git y pull requests
- Nunca commit directo a `main`. Todo cambio entra por rama y pull request.
- Un pull request = una tarea o un módulo. No mezclar cambios de módulos distintos en
  el mismo PR.
- Mensajes de commit con formato `tipo: descripción corta`
  (ej. `feat: agregar reserva de clases`, `fix: corregir cálculo de próximo pago`).
- La descripción del PR debe indicar qué cambió y cómo se probó.

## Qué NO tocar sin permiso explícito
- El módulo `membresias` (pagos/facturación) y cualquier migración de base de datos ya
  aplicada — pedir confirmación antes de modificar.
- Configuración de autenticación (`auth`) y variables de entorno.

## Definición de "terminado"
Una tarea está completa cuando: compila sin errores, pasa el lint, pasan todas las
pruebas (incluidas las nuevas), el preview deploy de Vercel funciona sin errores de
consola, y el pull request describe claramente el cambio y cómo se probó.