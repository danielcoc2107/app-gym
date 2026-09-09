# App Gym

Aplicación de entrenamiento personalizado con el equipo disponible en cada gimnasio.
La especificación incluye inventario compartido y un modo personal provisional para
entrenar mientras una sede nueva se verifica.

## Estado actual

T00: base Next.js App Router + TypeScript + Tailwind CSS, bienvenida responsive,
página «Cómo funciona», página 404 y pruebas automatizadas. El registro, Supabase,
inventario, planes y asistente corresponden a las siguientes tareas y aún no están
implementados. Las pantallas informativas no simulan datos guardados ni cuentas reales.
Validación local de T00 superada; PR publicados y preview de Vercel pendiente.
Ver [resultados y pasos de revisión](docs/entregas/t00.md).

## Desarrollo local

Requisitos: Node.js 24.x y npm. La versión de referencia está en `.nvmrc` y las
dependencias reproducibles en `package-lock.json`. Desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

Abrir [la aplicación local](http://localhost:3000). T00 no necesita credenciales,
archivos de entorno ni servicios de Supabase para arrancar.

En Windows, si PowerShell bloquea `npm.ps1` o `npx.ps1`, usar `npm.cmd` y `npx.cmd`
en los mismos comandos; no hace falta cambiar la política de ejecución de PowerShell.

## Validaciones

Preparar Chromium una vez, después de instalar dependencias:

```sh
npx playwright install chromium
```

Ejecutar en orden, deteniéndose si algún comando falla:

```sh
npm run lint
npm run test
npm run build
npm run test:e2e
```

`test` ejecuta Vitest con Testing Library y cobertura V8. Descubre archivos
`src/**/*.test.{ts,tsx}` y exige el 100% de la cobertura medible de la base T00;
Layout y metadatos declarativos no se incluyen en ese porcentaje; los E2E verifican
la integración del layout, pero no contienen aserciones específicas de metadatos.
`test:watch` es opcional durante desarrollo. `typecheck` comprueba los tipos por separado.
Las pruebas de navegador inician su propio servidor de producción en
`http://127.0.0.1:3100`; requieren una compilación previa y ese puerto libre.
No reutilizan un servidor existente, evitando probar por error otra versión.
Cubren Chromium de escritorio y emulación móvil Chromium; no equivalen a Safari real.

Los reportes quedan en `coverage/`, `playwright-report/` y `test-results/`, excluidos
de Git. Los fallos producen código de salida distinto de cero. La CI de GitHub
ejecuta estas comprobaciones y conserva los diagnósticos de fallos durante siete días.
El workflow se ejecutará en cada pull request y en cambios publicados en `main`.

`test:db` se incorporará en T01 con Supabase local/pgTAP y pruebas reales de RLS.
No hay un script vacío que aparente validar una base de datos inexistente.

## Estructura

```text
src/app/                 rutas, layout y estilos
src/components/          componentes visuales reutilizables
tests/setup.ts           preparación de Testing Library
tests/e2e/               recorridos de Playwright
.github/workflows/       comprobaciones automáticas
docs/                    especificación y tareas
```

Los módulos de negocio se crearán en `src/modules/` al implementar su tarea,
siguiendo las interfaces, repositorios y pruebas de [AGENTS.md](AGENTS.md).
Las pruebas unitarias viven junto al componente que verifican.

## Vercel y entornos posteriores

El proyecto usa la compilación estándar de Next.js y está preparado para importarse
en Vercel con Node.js 24, instalación `npm ci` y compilación `npm run build`.
No se ha creado ni conectado un proyecto remoto desde esta implementación.

La base T00 no necesita variables. Para T01, documentar y configurar con autorización
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` por entorno.
Claves elevadas y del proveedor de IA solo se incorporan en las tareas que las necesiten,
siempre en servidor. Nunca introducir credenciales de producción en CI o previews.
El entorno de pruebas de Supabase deberá ser local/efímero o un proyecto de pruebas
separado; un preview web por sí solo no separa sus datos.

## Documentación del producto

- [Especificación técnica](docs/especificacion.md).
- [Inventario provisional para sedes nuevas](docs/inventario-provisional.md).
- [Tareas pequeñas y criterios de aceptación](docs/tareas.md).
- [Arquitectura](docs/arquitectura.md).

Cada implementación va en su rama y PR. El usuario revisa el preview antes del merge;
`main` se mantiene como versión estable.
