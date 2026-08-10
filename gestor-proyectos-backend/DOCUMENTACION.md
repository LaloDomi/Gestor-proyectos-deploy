# ProjectFlow — Documentación técnica

Gestor de proyectos colaborativo con paneles por rol, chat en vivo, videollamadas, notificaciones por correo y un asistente de IA. Este documento explica **cómo está armado el código**, qué archivo hace qué, y cómo se conectan entre sí — pensado para quien tenga que leer, modificar o explicar el proyecto a nivel técnico.

## 1. Arquitectura general

```
Navegador (frontend/, HTML+JS sin framework, sin build)
        │  fetch() a /api/...  +  Socket.io (chat en vivo)
        ▼
Backend Express (gestor-proyectos-backend/)
        │
        ├── routes/       → qué URL existe
        ├── controllers/   → qué hace esa URL
        ├── models/        → cómo se lee/escribe en la base de datos
        └── services/      → integraciones externas (correo, IA, cron, sockets)
        │
        ▼
PostgreSQL en Supabase (una sola base, sin caché ni otra capa)
```

No hay build step en ningún lado: el frontend son archivos `.html`/`.js` que se sirven tal cual (estático), y el backend corre directo con `node server.js`.

## 2. Estructura de carpetas

```
gestor-proyectos-backend/
├── app.js                 # arma la app de Express y registra TODAS las rutas
├── server.js              # levanta el servidor HTTP + Socket.io + cron
├── config/
│   ├── db.js               # conexión (pool) a PostgreSQL
│   └── roles.js            # constantes ADMIN / LIDER / COLABORADOR
├── middleware/
│   └── auth.js             # valida el token JWT y los permisos por proyecto
├── models/                 # una clase por tabla, solo hablan con la base de datos
├── controllers/            # la lógica de cada endpoint (usa los models)
├── routes/                 # conecta una URL con su controller
├── services/                # correo, IA, cron de notificaciones, websockets
├── migrations/              # historial de cambios a la base de datos, en orden
├── scripts/                 # utilidades para correr una sola vez (migrar, etc.)
└── utils/                   # funciones chiquitas reutilizables (formato de fecha)

frontend/
├── api.js       # UN solo archivo con todas las llamadas al backend (fetch)
├── auth.js      # maneja la sesión (guarda el token, cierra sesión)
├── common.js    # todo el HTML/lógica de interfaz que se comparte entre páginas
├── styles.css   # estilos
└── *.html       # una página por pantalla (login, dashboard, project, chat, etc.)
```

**Patrón que se repite en todo el backend:** `routes → controller → model`.
Si quieres entender una funcionalidad, empieza por el archivo en `routes/`, ahí ves qué controller se llama, y el controller te dice qué model usa.

Ejemplo real (crear una tarea):
```
routes/tareaRoutes.js       →  router.post("/", ..., controller.create)
controllers/tareaController.js →  valida datos, llama a TareaModel.create()
models/TareaModel.js         →  hace el INSERT en la tabla Tareas
```

## 3. Base de datos (PostgreSQL / Supabase)

Las tablas originales del proyecto (`Roles`, `Estados`, `Prioridades`, `Usuarios`, `Proyectos`, `Tareas`, `Calendario`, `Reportes`) están descritas en `BaseDatos/Crearbase.sql` — **ojo:** ese archivo está en sintaxis de SQL Server y desactualizado; la base real vive en Supabase y sus cambios reales están en `gestor-proyectos-backend/migrations/`, que es la fuente de verdad.

| Migración | Qué agrega |
|---|---|
| `001_fase0_auth.sql` | `Roles.codigo`, `Usuarios.correo_verificado`/`estado_cuenta`, contraseñas ahora en hash |
| `002_fase1_membresia_invitaciones.sql` | `ProyectoMiembros` (quién pertenece a qué proyecto y con qué rol), `Invitaciones` |
| `003_fase2_notificaciones.sql` | `Notificaciones`, tokens de verificación de correo |
| `004_fase3_chat.sql` | `ChatCanales`, `ChatMensajes` |
| `005_fase4_videollamadas.sql` | `Videollamadas` |
| `006_fase5_reportes_ia.sql` | `Reportes.origen` (`manual` o `ia`) |

Para correrlas en una base nueva: `node scripts/runMigration.js migrations/00X_archivo.sql`, en orden.

## 4. Autenticación (JWT)

- `middleware/auth.js` exporta 3 funciones que se usan como middleware en las rutas:
  - `authenticate` — exige un token válido (`Authorization: Bearer <token>`)
  - `authorize(...roles)` — exige que el rol global del usuario sea uno de los indicados
  - `requireProjectMembership(resolverIdProyecto)` — exige que el usuario sea miembro de ESE proyecto específico (o admin)
- El token se genera en `controllers/authController.js` (función `emitirToken`) y contiene `id_usuario`, `id_rol`, `rol_codigo` — nada más, para mantenerlo chico.
- En el frontend, `auth.js` guarda `{token, usuario}` en `localStorage`, y `api.js` (función `apiRequest`) le pone el header `Authorization` a cada llamada automáticamente.

## 5. Cada funcionalidad — archivos exactos

### Roles, proyectos y equipos
- `controllers/proyectoController.js` — crear/editar proyectos, decide qué proyectos ve cada usuario según su rol
- `models/ProyectoMiembroModel.js` — quién es miembro de qué proyecto
- `controllers/invitacionController.js` + `models/InvitacionModel.js` — generar y aceptar invitaciones por token
- Frontend: `team.html` (gestión de equipo/roles), `invite-accept.html` (aceptar invitación), `project.html` (miembros, botón invitar)

### Notificaciones y correo
- `services/emailService.js` — envía correos reales (Gmail SMTP vía Nodemailer)
- `services/cronJobs.js` — job diario que revisa tareas/eventos por vencer y genera notificaciones
- `controllers/notificacionController.js` + `models/NotificacionModel.js`
- Frontend: `notifications.html`

### Chat en vivo
- `services/realtime/index.js` — servidor de Socket.io: valida el token en la conexión, controla quién puede unirse a qué canal y quién puede mandar mensajes
- `models/ChatCanalModel.js` / `ChatMensajeModel.js` — canales (por proyecto o directos) y sus mensajes
- `server.js` — aquí se conecta Socket.io al mismo servidor HTTP de Express (`http.createServer(app)` en vez de `app.listen` directo)
- Frontend: `chat.html` (usa `socket.io-client` desde CDN)

### Videollamadas
- `models/VideollamadaModel.js` — genera un nombre de sala único por proyecto y reutiliza la sala activa si ya hay una
- `controllers/videollamadaController.js`
- Frontend: `videollamada.html` (embebe el widget de Jitsi Meet desde `meet.jit.si`)

### Asistente de IA
- `services/aiService.js` — arma el contexto real del proyecto (tareas, avance, equipo) y se lo manda a Gemini con instrucciones de responder solo con esos datos
- `controllers/iaController.js` + `routes/iaRoutes.js`
- Frontend: `assistant.html`

## 6. Archivos "columna vertebral"

- **`app.js`** — aquí se registran todas las rutas (`app.use("/api/algo", algoRoutes)`). Si buscas si existe un endpoint, este es el primer lugar.
- **`frontend/api.js`** — un solo objeto `api` con una función por cada endpoint del backend, agrupado por sección (`api.auth`, `api.proyectos`, `api.chat`, `api.ia`, etc.). Es el mapa completo de qué puede hacer el frontend.
- **`frontend/common.js`** — todas las funciones que generan HTML compartido entre páginas (sidebar, tarjetas de proyecto, formularios, los tres paneles según rol, etc.).
- **`gestor-proyectos-backend/.env`** — toda la configuración sensible (conexión a base de datos, JWT, correo, IA).

## 7. Variables de entorno (`.env`)

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | conexión a PostgreSQL (Supabase) |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | firman y expiran las sesiones |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `GMAIL_SENDER_NAME` | envío de correos reales |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | asistente de IA |
| `FRONTEND_URL` | para armar los enlaces dentro de los correos |
| `PORT` | puerto del servidor (Render lo asigna solo) |

## 8. Cómo correrlo en local

```bash
cd gestor-proyectos-backend
npm install
npm run dev              # backend en http://localhost:3000

# en otra terminal
cd frontend
python -m http.server 8080   # frontend en http://localhost:8080
```

El frontend por defecto apunta al backend ya desplegado en producción (`frontend/api.js`, constante `API_BASE_URL`). Para probar contra el backend local, agrega antes de cargar `api.js` en cualquier página:
```html
<script>window.API_BASE_URL = "http://localhost:3000/api";</script>
```
