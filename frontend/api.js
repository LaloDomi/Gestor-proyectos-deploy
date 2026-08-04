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

/**
 * Wrapper genérico sobre fetch().
 * Lanza un Error con el mensaje del backend cuando la respuesta no es OK,
 * para que cada pantalla pueda mostrarlo tal cual.
 */
async function apiRequest(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
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

  if (!res.ok) {
    const message = (data && data.error) || `Error ${res.status} al llamar a ${path}`;
    throw new Error(message);
  }
  return data;
}

const api = {
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
    login: (correo, contrasena) =>
      apiRequest("/usuarios/login", { method: "POST", body: { correo, contrasena } }),
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

  // ---------- Reportes ----------
  reportes: {
    getAll: () => apiRequest("/reportes"),
    getById: (id) => apiRequest(`/reportes/${id}`),
    create: (reporte) => apiRequest("/reportes", { method: "POST", body: reporte }),
    update: (id, reporte) => apiRequest(`/reportes/${id}`, { method: "PUT", body: reporte }),
    remove: (id) => apiRequest(`/reportes/${id}`, { method: "DELETE" }),
  },
};
