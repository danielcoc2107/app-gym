# Sede nueva e inventario personal provisional

Decisión de producto incorporada el 2026-09-06. Complementa RF-02/RF-03/RF-04 y la
[matriz de permisos](especificacion.md#5-usuarios-y-permisos).

## 1. Problema y solución

Una sede nueva puede no tener gestor ni equipos publicados. Esperar esas aprobaciones
impedía que su primer usuario generara un plan aunque conociera los recursos presentes.
Se incorpora el modo **inventario personal provisional**, confirmado por su titular,
con el que puede generar y ejecutar rutinas mientras se revisa la sede.

La aprobación administrativa determina la publicación de la sede. La confirmación del
titular permite usar sus recursos privados; la revisión del gestor/admin permite
publicar recursos compartidos. Son decisiones independientes con distinto alcance.
El alta inicial no concede un rol. Un inventario genérico no prueba la existencia de
máquinas: se puede ofrecer un listado del catálogo para marcar lo observado, sin
selecciones automáticas ni equipos presumidos.

## 2. Flujo del primer usuario

1. El deportista busca una sede y, si falta, propone nombre y dirección. Recibe un
   `site_id` persistente en estado `pending`, accesible para él y el administrador.
2. La pantalla muestra «Sede en proceso de verificación» y la acción «Entrenar con
   mi inventario». Puede usarla inmediatamente, sin rol de colaborador/gestor.
3. Registra sus recursos observados desde el catálogo y confirma presencia, tipo,
   cantidad/unidades, accesorios y características necesarias. Una foto es opcional;
   un resultado de IA o un borrador sin confirmar no habilita el recurso.
4. Genera un plan con `inventory_source = personal_confirmed`. Si cumple las reglas
   de catálogo, tiempo, restricciones y cobertura, puede activarlo e iniciar sesión.
5. Plan y sesión muestran «Inventario personal confirmado por ti», junto al estado
   de la sede. Esto no implica que se haya enviado a revisión; los recursos son privados.
6. Puede enviar una copia de equipos concretos a revisión compartida. El gestor o
   administrador decide su publicación cuando la sede esté publicada.

También se ofrece este modo en una sede publicada cuyo inventario esté vacío o sea
insuficiente. Cualquier deportista puede confirmar su propia lista allí; nunca utiliza
automáticamente la lista provisional de otra persona.

## 3. Estados y elegibilidad

| Elemento | Estado/alcance | ¿Sirve para generar? |
| --- | --- | --- |
| Sede pendiente (`pending`) | Visible al proponente y administrador | Sí, para su proponente con inventario personal confirmado. |
| Sede publicada (`published`) | Visible a usuarios autenticados | Sí, con la fuente elegida y autorizada. |
| Equipo compartido (`shared`) | Publicado, revisado y operativo | Sí, en `shared_verified`. |
| Equipo personal (`personal`) | Confirmado por su dueño y operativo | Sí, solo para su dueño en `personal_confirmed`. |
| Equipo borrador / sugerido por IA | Sin confirmación válida | No. |
| Equipo compartido pendiente de revisión | Propuesta compartida, incluso de otro usuario | No. |
| Sede rechazada/fusionada (`rejected`/`merged`) | Referencia histórica con resolución | Requiere elegir/reasociar sede y regenerar antes de nuevas sesiones. |

En el MVP cada plan usa exactamente una fuente, compartida o personal; no se suman
inventarios. La fuente se conserva en sesiones, alternativas y contexto del asistente.
`complete` describe viabilidad del plan, no verificación administrativa del inventario.
La falta de gestor no causa `infeasible`; la falta real de recursos suficientes sí
puede causarlo bajo las reglas existentes. Si el usuario no confirma ningún recurso,
pedir confirmación de recursos/espacio: no generar automáticamente un plan genérico.

## 4. Permisos y confirmación

- Cualquier deportista puede crear, editar y confirmar recursos personales dentro de
  una sede publicada o una propuesta pendiente propia. No necesita un rol de sede.
- Cada recurso tiene dueño, alcance, estado de confirmación, versión y fecha/actor de
  confirmación. Editar tipo, accesorios, cantidad o presencia invalida la confirmación.
- Solo su titular lee esos recursos/fotos; tampoco el gestor los ve por su rol.
- Compartir crea una propuesta independiente con nuevos IDs y solo los campos/fotos
  seleccionados. El titular autoriza revisión y eventual publicación; no comparte
  sus rutinas, medidas ni el resto de su lista. El original sigue privado.
- Este envío acotado está permitido al deportista sin conceder edición del inventario
  común. La copia queda pendiente, auditable e idempotente; solo gestor/admin publica.
- El revisor comprueba duplicados/unidad física antes de crear otro recurso compartido.
  No sumar dos propuestas del mismo aparato como si fueran dos unidades.
- Antes de iniciar/reanudar una sesión personal, pedir confirmar que los recursos
  utilizados siguen presentes y operativos; cambios obligan a revalidar el plan.
- Fotos personales pueden pasar por reconocimiento con los mismos controles y cuotas.
  El titular confirma su uso personal; la IA nunca publica ni confirma por sí sola.

## 5. Revisión de sede y transición

Publicar una sede no publica equipos, cambia roles ni sustituye la fuente del plan.
Cuando exista inventario compartido útil, ofrecer «Crear plan con inventario de la
sede»: validar de nuevo y activar una versión nueva solo tras confirmación del usuario.
El plan personal puede seguir utilizándose mientras su sede/contexto sean válidos.

Si una sede se rechaza o se reconoce como duplicada, conservar su ID histórico,
resolución y, para duplicados, `canonical_site_id` publicado. Pedir al titular confirmar
la sede destino, copiar/reconfirmar allí sus recursos personales y generar un nuevo
plan. No mover recursos o sesiones históricas silenciosamente ni asignar equipo de
otra sede al plan anterior. Una sesión ya iniciada conserva sus resultados y puede
cerrarse/abandonarse; se pausa su continuación guiada hasta resolver el contexto.

El modo personal no caduca por la tardanza de un revisor; sí pierde elegibilidad una
confirmación invalidada o un recurso retirado. Exportación y borrado incluyen recursos
y fotos personales. Los aportes ya publicados conservan el tratamiento compartido
descrito en [el modelo de datos](modelo-datos.md).

## 6. Criterios de aceptación y pruebas

1. Cuenta deportista sin roles → sede pendiente propia → equipos confirmados suficientes
   → plan completo → sesión: funciona sin que participe un administrador/gestor.
2. Sede publicada vacía: el mismo flujo personal funciona sin publicar equipos.
3. Cuenta B, gestor y admin no leen el inventario/fotos personales de A; B no puede usar
   la sede pendiente de A ni sus IDs para generar planes, subir fotos o sustituir ejercicios.
4. Listado genérico vacío de selecciones y foto ambigua no habilitan recursos; las
   reglas de cobertura, nivel, accesorios y restricciones se aplican en ambos modos.
5. Confirmar o editar equipo personal no crea roles, publica equipos ni cambia su alcance.
6. Enviar dos veces una copia no duplica propuestas; editar el original después no
   altera la copia enviada; publicación revisa versión y posible duplicado físico.
7. Alternativas y asistente respetan la fuente personal; no consumen propuestas ajenas.
8. Aprobación, rechazo, fusión y cambio voluntario al inventario compartido conservan
   series e historial y piden confirmación para nuevos planes/contextos.

Implementar estos casos en T03/T06/T07–T12 y validar el recorrido completo en T18,
según [el backlog](tareas.md). Esta decisión modifica documentación, no infraestructura.
