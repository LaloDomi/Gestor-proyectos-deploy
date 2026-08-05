# ProjectFlow — Frontend conectado al backend real

Este frontend (HTML + JS puro) ya no usa datos inventados: todo pasa por tu
API en `gestor-proyectos-backend` (Node.js + Express + SQL Server, base
`GestorProyectos`).

## Cómo levantar todo

1. **Base de datos**: ejecuta en SQL Server, en este orden, los scripts de
   `BaseDatos/`: `Crearbase.sql` → `Insertardatos.sql` (opcional, son datos de
   ejemplo).
2. **Backend**:
   ```bash
   cd gestor-proyectos-backend
   npm install
   cp .env.example .env      # y edítalo con tus credenciales de SQL Server
   npm run dev                # o: npm start
   ```
   Debe quedar escuchando en `http://localhost:3000`.
3. **Frontend**: abre `login.html` con Live Server (o cualquier servidor
   estático). Como el backend ya trae `cors()` sin restricciones, funciona
   sin importar en qué puerto sirvas el frontend.

Si tu backend corre en otra URL/puerto, defínelo antes de cargar `api.js`,
por ejemplo agregando en el `<head>` de cada `.html`:
```html
<script>window.API_BASE_URL = "http://localhost:4000/api";</script>
```

## Qué cambié y por qué

Archivos nuevos:
- **`api.js`**: cliente único con una función por cada endpoint real de
  `app.js` (roles, estados, prioridades, usuarios, proyectos, tareas,
  calendario, reportes). Todas las páginas lo usan en vez de tener `fetch`
  repetido por todos lados.
- **`auth.js`**: como el backend no genera JWT (lo dice su propio README),
  la "sesión" es el objeto `usuario` que devuelve `POST /api/usuarios/login`,
  guardado en `localStorage`. `requireAuth()` protege cada página y
  redirige a `login.html` si no hay sesión.

Archivos reescritos:
- **`common.js`**: se quitaron **todos** los arrays de datos ficticios
  (`PROJECTS`, `TASKS`, `NOTIFICATIONS`, `TEAM`, `WEEKLY`, `CURRENT_USER`
  fijo). Las funciones de render ahora reciben los datos ya cargados desde
  la API como parámetros, y los estados/prioridades usados para colorear
  (`Pendiente`, `En proceso`, `Finalizado`, `Cancelado` / `Baja`, `Media`,
  `Alta`, `Urgente`) son los que **realmente existen** en tu tabla
  `Estados`/`Prioridades` (`Insertardatos.sql`), no los que traía la
  maqueta original.
- **`login.html` / `register.html`**: login real contra
  `POST /api/usuarios/login`; registro real contra `POST /api/usuarios`,
  con el selector de rol poblado desde `GET /api/roles`.
- **`dashboard.html`**: proyectos, avance (`/api/proyectos/avance`), tareas
  y conteo por estado (`/api/tareas/stats/estado`) vienen del backend. El
  gráfico de "tareas por semana" se reemplazó por uno de "tareas por
  estado", porque la base de datos no guarda fecha de finalización para
  poder calcular avance semanal real.
- **`projects.html`**: listado real + formulario para crear proyectos
  (`POST /api/proyectos`), pidiendo estado y responsable de las tablas
  reales.
- **`project.html`**: tablero Kanban con **una columna por cada estado real**
  de la tabla `Estados`. Cambiar una tarea de columna hace
  `PUT /api/tareas/:id`; también puedes crear (`POST`) y eliminar
  (`DELETE`) tareas.
- **`calendar.html`**: eventos reales de `GET /api/calendario`.
- **`notifications.html`**: **ver nota abajo**.

## Cosas que la base de datos no tenía y tuve que resolver

- **Comentarios y adjuntos en tareas**: la tabla `Tareas` no tiene esas
  columnas ni tablas relacionadas, así que ese panel del modal original se
  quitó (para no simular algo que no se guarda). En su lugar se muestra la
  `descripcion` real de la tarea.
- **Miembros por proyecto / avatar grupal**: `Proyectos` solo tiene un
  `id_responsable` (un usuario), no una lista de integrantes. Por eso las
  tarjetas de proyecto muestran un solo avatar (el responsable), no una
  pila de varios.
- **Notificaciones**: no existe tabla `Notificaciones` en la base. La
  pantalla de notificaciones ahora **calcula** avisos en el navegador a
  partir de datos reales (tareas por vencer o vencidas, eventos de
  calendario próximos); el estado leído/no-leído se guarda en
  `localStorage`, no en el servidor. Si quieres notificaciones reales,
  habría que agregar una tabla `Notificaciones` y sus endpoints al backend
  — dímelo y te ayudo a extenderlo.

## Seguridad (heredado del backend, no lo oculto)

El propio README del backend ya lo advierte: las contraseñas se guardan y
comparan en texto plano, y no hay JWT ni rutas protegidas en el servidor.
Este frontend lo respeta tal cual está (por eso la "sesión" es solo un
`localStorage`, no un token). Antes de usar esto en producción, conviene
agregar `bcrypt` para contraseñas y JWT para proteger las rutas, tal como
sugiere el propio README del backend.
