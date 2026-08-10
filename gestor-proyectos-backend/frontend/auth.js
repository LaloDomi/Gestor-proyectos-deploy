/* =========================================================
   PROJECTFLOW — Sesión / Autenticación
   El backend emite un JWT en /api/auth/login y /api/auth/register.
   Guardamos {token, usuario} en localStorage; api.js adjunta el token
   como header Authorization en cada llamada.
   ========================================================= */

const SESSION_KEY = "projectflow_session";

function saveSession(token, usuario) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ token, usuario }));
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

function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !payload.exp || Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

/** Redirige a login.html si no hay sesión activa (o expiró). Úsalo al inicio de cada página protegida. */
function requireAuth() {
  const session = getSession();
  if (!session || tokenExpirado(session.token)) {
    clearSession();
    window.location.href = "login.html";
    return null;
  }
  return session.usuario;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}
