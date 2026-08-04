/* =========================================================
   PROJECTFLOW — Sesión / Autenticación
   El backend no usa tokens (no hay JWT en el proyecto), así que
   guardamos el usuario devuelto por POST /api/usuarios/login en
   localStorage y lo usamos como "sesión" en el navegador.
   ========================================================= */

const SESSION_KEY = "projectflow_session";

function saveSession(usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/** Redirige a login.html si no hay sesión activa. Úsalo al inicio de cada página protegida. */
function requireAuth() {
  const user = getSession();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}
