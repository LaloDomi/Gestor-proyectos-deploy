# GestorProyectos - Backend API (Node.js + Express + SQL Server)

> ⚠️ **Nota importante:** pediste el backend "en React", pero React es una librería de **frontend** (corre en el navegador) y no puede conectarse directamente a SQL Server ni exponer endpoints. Lo que sí puede consumir un backend es una app en React. Por eso este backend está hecho en **Node.js + Express**, que es el estándar para este tipo de APIs y funciona perfecto para probarse con Postman. Si luego quieres el frontend en React que consuma esta API, con gusto lo armamos.

## Estructura del proyecto

```
gestor-proyectos-backend/
├── config/
│   └── db.js                  # Conexión (pool) a SQL Server
├── models/                    # Acceso a datos (una clase por tabla)
│   ├── RolModel.js
│   ├── EstadoModel.js
│   ├── PrioridadModel.js
│   ├── UsuarioModel.js
│   ├── ProyectoModel.js
│   ├── TareaModel.js
│   ├── CalendarioModel.js
│   └── ReporteModel.js
├── controllers/                # Lógica de cada endpoint
├── routes/                     # Definición de rutas Express
├── app.js                      # Configuración de Express
├── server.js                   # Punto de arranque
├── .env.example                # Variables de entorno de ejemplo
├── GestorProyectos.postman_collection.json  # Colección lista para importar en Postman
└── package.json
```

## 1. Requisitos previos

- Node.js 18+ instalado
- SQL Server con la base `GestorProyectos` ya creada (el script que enviaste)
- Postman (para las pruebas)

## 2. Instalación

```bash
cd gestor-proyectos-backend
npm install
```

## 3. Configuración de la base de datos

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` con tus datos reales de conexión, por ejemplo:

```
DB_USER=sa
DB_PASSWORD=TuPassword123
DB_SERVER=localhost
DB_DATABASE=GestorProyectos
DB_PORT=1433
DB_TRUST_CERT=true
DB_ENCRYPT=false
PORT=3000
```

Si usas SQL Server con una **instancia con nombre** (ej. `localhost\SQLEXPRESS`) en vez de puerto, cambia
`DB_SERVER=localhost\\SQLEXPRESS` y puedes quitar `DB_PORT` (o dejarlo, el driver lo ignora si detecta instancia con nombre en el string... en ese caso lo más simple es usar el puerto TCP fijo que le hayas configurado en SQL Server Configuration Manager).

## 4. Levantar el servidor

```bash
npm run dev     # con nodemon (recarga automática)
# o
npm start       # sin nodemon
```

Si todo está bien verás en consola:

```
✅ Conectado a SQL Server - Base de datos: GestorProyectos
🚀 Servidor corriendo en http://localhost:3000
```

Abre `http://localhost:3000/` en el navegador y deberías ver un JSON de bienvenida con la lista de endpoints.

## 5. Endpoints disponibles

Todos con base en `http://localhost:3000/api`

| Recurso | Método | Ruta | Descripción |
|---|---|---|---|
| Roles | GET | `/roles` | Listar todos |
| Roles | GET | `/roles/:id` | Obtener uno |
| Roles | POST | `/roles` | Crear |
| Roles | PUT | `/roles/:id` | Actualizar |
| Roles | DELETE | `/roles/:id` | Eliminar |
| Estados | GET/POST/PUT/DELETE | `/estados[/:id]` | CRUD completo |
| Prioridades | GET/POST/PUT/DELETE | `/prioridades[/:id]` | CRUD completo |
| Usuarios | GET/POST/PUT/DELETE | `/usuarios[/:id]` | CRUD completo (incluye nombre del rol vía JOIN) |
| Usuarios | POST | `/usuarios/login` | Login simple por correo/contraseña |
| Proyectos | GET/POST/PUT/DELETE | `/proyectos[/:id]` | CRUD completo (incluye estado y responsable) |
| Proyectos | GET | `/proyectos/avance` | % de avance por proyecto (igual a tu consulta SQL) |
| Tareas | GET/POST/PUT/DELETE | `/tareas[/:id]` | CRUD completo (incluye proyecto, responsable, prioridad, estado) |
| Tareas | GET | `/tareas/proyecto/:id_proyecto` | Tareas de un proyecto específico |
| Tareas | GET | `/tareas/stats/estado` | Conteo de tareas agrupado por estado |
| Tareas | GET | `/tareas/stats/prioridad` | Conteo de tareas agrupado por prioridad |
| Calendario | GET/POST/PUT/DELETE | `/calendario[/:id]` | CRUD completo |
| Reportes | GET/POST/PUT/DELETE | `/reportes[/:id]` | CRUD completo |

Todas las consultas "especiales" de tu script SQL (joins de usuarios+rol, proyectos+estado+responsable, tareas con todo, conteos por estado/prioridad, % de avance) ya están integradas dentro de los `GET` normales o en endpoints dedicados (`/proyectos/avance`, `/tareas/stats/estado`, `/tareas/stats/prioridad`), no tuvimos que duplicarlas aparte.

## 6. Probar con Postman

1. Abre Postman.
2. Click en **Import** → selecciona el archivo `GestorProyectos.postman_collection.json`.
3. Se cargará la colección **GestorProyectos API** con una carpeta por cada tabla y ejemplos de body ya armados para POST/PUT.
4. La variable `base_url` ya viene configurada a `http://localhost:3000/api`; si cambias el puerto, edítala en la colección (ícono de los "ojos" → Edit).
5. Ejecuta primero los `GET` para confirmar que hay datos (ya tienes los INSERT de tu script), y luego prueba POST/PUT/DELETE.

## 7. Notas importantes / seguridad (léelas antes de usarlo más allá de pruebas)

- **Contraseñas en texto plano:** tal cual está tu tabla `Usuarios`, la contraseña se guarda y compara en texto plano. Esto es aceptable únicamente para pruebas en Postman. Antes de usarlo en algo real, hay que hashear contraseñas (ej. `bcrypt`) y nunca compararlas ni guardarlas en claro.
- **Sin autenticación de rutas:** el endpoint `/login` valida credenciales pero no genera ningún token (JWT) todavía, así que ninguna ruta está protegida. Si más adelante lo necesitas, se puede agregar JWT y middleware de autenticación.
- **Validaciones mínimas:** cada `create`/`update` valida solo los campos obligatorios (NOT NULL) para que no truene la inserción; no valida formatos de correo, fechas coherentes (que `fecha_fin` sea posterior a `fecha_inicio`), etc. Se puede reforzar si quieres.
- **Fechas y horas:** en el body de Calendario, manda `hora` como string `"HH:MM"` o `"HH:MM:SS"`. Las fechas van como `"YYYY-MM-DD"`.
- **CORS:** está abierto a cualquier origen (`cors()` sin opciones) para que puedas probar fácil desde cualquier frontend (React, etc.) más adelante.

## 8. Siguiente paso sugerido

Si quieres, puedo ayudarte a:
1. Armar el **frontend en React** que consuma esta API.
2. Agregar **autenticación con JWT** para proteger las rutas.
3. Agregar **hashing de contraseñas** con bcrypt.

Dime cuál de esos quieres que hagamos primero.
