/* =========================================================
   PROJECTFLOW — Cliente API
   Conecta el frontend con el backend Express
   (gestor-proyectos-backend) que a su vez habla con SQL Server.

   Cambia API_BASE_URL si tu backend corre en otra URL/puerto.
   Por defecto el backend usa: http://localhost:3000
   ========================================================= */

const API_BASE_URL =
  window.API_BASE_URL ||
  "https://gestor-proyectos-deploy.onrender.com/api";

// Socket.io corre en el mismo servidor Express, sin el prefijo /api.
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Wrapper genérico sobre fetch().
 * Lanza un Error con el mensaje del backend cuando la respuesta no es OK,
 * para que cada pantalla pueda mostrarlo tal cual.
 */
async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = typeof getToken === "function" ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "No se pudo conectar con el servidor. Verifica que el backend esté corriendo en " + API_BASE_URL
    );
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (res.status === 401 && typeof clearSession === "function") {
    clearSession();
    if (!location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
  }

  if (!res.ok) {
    const message = (data && data.error) || `Error ${res.status} al llamar a ${path}`;
    throw new Error(message);
  }
  return data;
}

const api = {
  // ---------- Auth ----------
  auth: {
    register: (usuario) => apiRequest("/auth/register", { method: "POST", body: usuario }),
    login: (correo, contrasena) =>
      apiRequest("/auth/login", { method: "POST", body: { correo, contrasena } }),
    verifyEmail: (token) => apiRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`),
    resendVerification: () => apiRequest("/auth/resend-verification", { method: "POST" }),
  },

  // ---------- Roles ----------
  roles: {
    getAll: () => apiRequest("/roles"),
  },

  // ---------- Estados ----------
  estados: {
    getAll: () => apiRequest("/estados"),
  },

  // ---------- Prioridades ----------
  prioridades: {
    getAll: () => apiRequest("/prioridades"),
  },

  // ---------- Usuarios ----------
  usuarios: {
    getAll: () => apiRequest("/usuarios"),
    getById: (id) => apiRequest(`/usuarios/${id}`),
    create: (usuario) => apiRequest("/usuarios", { method: "POST", body: usuario }),
    update: (id, usuario) => apiRequest(`/usuarios/${id}`, { method: "PUT", body: usuario }),
    remove: (id) => apiRequest(`/usuarios/${id}`, { method: "DELETE" }),
    actualizarRol: (id, id_rol) => apiRequest(`/usuarios/${id}/rol`, { method: "PUT", body: { id_rol } }),
  },

  // ---------- Proyectos ----------
  proyectos: {
    getAll: () => apiRequest("/proyectos"),
    getById: (id) => apiRequest(`/proyectos/${id}`),
    getAvance: () => apiRequest("/proyectos/avance"),
    create: (proyecto) => apiRequest("/proyectos", { method: "POST", body: proyecto }),
    update: (id, proyecto) => apiRequest(`/proyectos/${id}`, { method: "PUT", body: proyecto }),
    remove: (id) => apiRequest(`/proyectos/${id}`, { method: "DELETE" }),
  },

  // ---------- Miembros de proyecto ----------
  miembros: {
    getAll: (idProyecto) => apiRequest(`/proyectos/${idProyecto}/miembros`),
    add: (idProyecto, id_usuario, rol_proyecto) =>
      apiRequest(`/proyectos/${idProyecto}/miembros`, { method: "POST", body: { id_usuario, rol_proyecto } }),
    actualizarRol: (idProyecto, idUsuario, rol_proyecto) =>
      apiRequest(`/proyectos/${idProyecto}/miembros/${idUsuario}`, { method: "PUT", body: { rol_proyecto } }),
    remove: (idProyecto, idUsuario) =>
      apiRequest(`/proyectos/${idProyecto}/miembros/${idUsuario}`, { method: "DELETE" }),
  },

  // ---------- Invitaciones ----------
  invitaciones: {
    crear: (idProyecto, correo, rol_proyecto) =>
      apiRequest(`/proyectos/${idProyecto}/invitaciones`, { method: "POST", body: { correo, rol_proyecto } }),
    listarPorProyecto: (idProyecto) => apiRequest(`/proyectos/${idProyecto}/invitaciones`),
    consultar: (token) => apiRequest(`/invitaciones/${token}`),
    aceptar: (token, datos) => apiRequest(`/invitaciones/${token}/aceptar`, { method: "POST", body: datos }),
  },

  // ---------- Tareas ----------
  tareas: {
    getAll: () => apiRequest("/tareas"),
    getById: (id) => apiRequest(`/tareas/${id}`),
    getByProyecto: (idProyecto) => apiRequest(`/tareas/proyecto/${idProyecto}`),
    contarPorEstado: () => apiRequest("/tareas/stats/estado"),
    contarPorPrioridad: () => apiRequest("/tareas/stats/prioridad"),
    create: (tarea) => apiRequest("/tareas", { method: "POST", body: tarea }),
    update: (id, tarea) => apiRequest(`/tareas/${id}`, { method: "PUT", body: tarea }),
    remove: (id) => apiRequest(`/tareas/${id}`, { method: "DELETE" }),
  },

  // ---------- Calendario ----------
  calendario: {
    getAll: () => apiRequest("/calendario"),
    getById: (id) => apiRequest(`/calendario/${id}`),
    create: (evento) => apiRequest("/calendario", { method: "POST", body: evento }),
    update: (id, evento) => apiRequest(`/calendario/${id}`, { method: "PUT", body: evento }),
    remove: (id) => apiRequest(`/calendario/${id}`, { method: "DELETE" }),
  },

  // ---------- Chat ----------
  chat: {
    getCanales: () => apiRequest("/chat/canales"),
    getCanalProyecto: (idProyecto) => apiRequest(`/chat/proyecto/${idProyecto}`),
    getCanalDirecto: (idUsuario) => apiRequest(`/chat/directo/${idUsuario}`),
    getMensajes: (idCanal) => apiRequest(`/chat/canales/${idCanal}/mensajes`),
  },

  // ---------- Videollamadas ----------
  videollamadas: {
    iniciarOUnirse: (idProyecto) => apiRequest(`/proyectos/${idProyecto}/videollamadas`, { method: "POST" }),
    getByProyecto: (idProyecto) => apiRequest(`/proyectos/${idProyecto}/videollamadas`),
  },

  // ---------- Asistente de IA ----------
  ia: {
    resumen: (idProyecto) => apiRequest(`/ia/proyectos/${idProyecto}/resumen`, { method: "POST" }),
    preguntar: (idProyecto, pregunta) => apiRequest(`/ia/proyectos/${idProyecto}/preguntar`, { method: "POST", body: { pregunta } }),
    generarReporte: (idProyecto) => apiRequest(`/ia/proyectos/${idProyecto}/reporte`, { method: "POST" }),
    getReportes: (idProyecto) => apiRequest(`/ia/proyectos/${idProyecto}/reportes`),
  },

  // ---------- Notificaciones ----------
  notificaciones: {
    getAll: () => apiRequest("/notificaciones"),
    marcarLeida: (id) => apiRequest(`/notificaciones/${id}/leida`, { method: "PUT" }),
    marcarTodas: () => apiRequest("/notificaciones/marcar-todas", { method: "PUT" }),
  },

  // ---------- Reportes ----------
  reportes: {
    getAll: () => apiRequest("/reportes"),
    getById: (id) => apiRequest(`/reportes/${id}`),
    create: (reporte) => apiRequest("/reportes", { method: "POST", body: reporte }),
    update: (id, reporte) => apiRequest(`/reportes/${id}`, { method: "PUT", body: reporte }),
    remove: (id) => apiRequest(`/reportes/${id}`, { method: "DELETE" }),
  },
};
