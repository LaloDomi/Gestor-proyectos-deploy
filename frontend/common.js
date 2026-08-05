/* =========================================================
   PROJECTFLOW — Librería compartida (UI + adaptadores de datos)
   Se incluye en TODAS las páginas .html, después de api.js y auth.js.

   A diferencia de la versión de maqueta, aquí NO hay datos
   inventados: todo se pide al backend (gestor-proyectos-backend)
   que a su vez consulta SQL Server (GestorProyectos).
   ========================================================= */

const C = {
  bg: "#12141B", surface: "#1A1D27", surface2: "#20232F", border: "#262A36",
  text: "#ECE9E2", sub: "#8B8F9C", accent: "#F5A524",
  success: "#4ADE80", risk: "#F1563F", info: "#5B8DEF", purple: "#B48CE0", blue2: "#6BA5E0",
  urgent: "#D6273D", neutral: "#6B7080",
};

/* Los nombres de estado/prioridad son los que existen realmente en la
   base de datos (tablas Estados y Prioridades, ver Insertardatos.sql).
   Si alguien agrega un estado/prioridad nuevo desde /api, se usa un
   color por defecto (neutral) para que la interfaz no se rompa. */
const STATUS_COLORS = {
  "Pendiente": C.neutral,
  "En proceso": C.info,
  "Finalizado": C.success,
  "Cancelado": C.risk,
};
const PRIORITY_COLORS = {
  "Baja": C.blue2,
  "Media": C.accent,
  "Alta": C.risk,
  "Urgente": C.urgent,
};
function statusColor(nombre) { return STATUS_COLORS[nombre] || C.neutral; }
function priorityColor(nombre) { return PRIORITY_COLORS[nombre] || C.neutral; }

const AVATAR_COLORS = [C.info, C.accent, C.purple, C.success, C.risk];
const PROJECT_COLORS = [C.info, C.accent, C.purple, C.success, C.risk, C.blue2];

/* ---------- Iconos SVG simples (propios, trazo único) ---------- */
function icon(name, { size = 16, color = "currentColor", stroke = 2 } = {}) {
  const attrs = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  const paths = {
    dashboard: `<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>`,
    folder: `<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6Z"/>`,
    calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
    bell: `<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/>`,
    logout: `<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4"/><path d="M15 16l4-4-4-4"/><path d="M19 12H9"/>`,
    plus: `<path d="M12 5v14M5 12h14"/>`,
    search: `<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>`,
    message: `<path d="M4 5h16v11H8l-4 4V5Z"/>`,
    video: `<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3.5v11L16 14"/>`,
    paperclip: `<path d="M20 12.5 12 20.5a4.2 4.2 0 0 1-6-6l8-8a2.8 2.8 0 0 1 4 4l-8 8a1.4 1.4 0 0 1-2-2l7-7"/>`,
    x: `<path d="M18 6 6 18M6 6l12 12"/>`,
    chevronLeft: `<path d="M15 18l-6-6 6-6"/>`,
    chevronRight: `<path d="M9 18l6-6-6-6"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>`,
    alert: `<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17.5v.1"/>`,
    mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 6l9 7 9-7"/>`,
    lock: `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
    arrowRight: `<path d="M5 12h14M13 6l6 6-6 6"/>`,
    user: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>`,
    check: `<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>`,
    more: `<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>`,
    trending: `<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>`,
    circle: `<circle cx="12" cy="12" r="8"/>`,
    trash: `<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13"/>`,
  };
  return `<svg ${attrs}>${paths[name] || ""}</svg>`;
}
function pulseDot(color, size = 8) {
  return `<span class="pulse" style="width:${size}px;height:${size}px;">
    <span class="ping" style="background:${color}"></span>
    <span class="dot" style="background:${color}"></span>
  </span>`;
}
function initials(name) { return (name || "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase(); }
function avatarColor(name) { const sum = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0); return AVATAR_COLORS[sum % AVATAR_COLORS.length]; }
function avatar(name, size = 28) { return `<div class="avatar" title="${name || ""}" style="width:${size}px;height:${size}px;font-size:${size * 0.4}px;background:${avatarColor(name)}">${initials(name)}</div>`; }
function badge(text, color) { return `<span class="badge" style="color:${color};border-color:${color}55;background:${color}18">${text}</span>`; }
function projectColor(id) { return PROJECT_COLORS[id % PROJECT_COLORS.length]; }

function loadingHTML(msg = "Cargando…") {
  return `<div style="padding:40px;text-align:center;color:${C.sub};font-size:14px;">${msg}</div>`;
}
function errorHTML(err) {
  const msg = err && err.message ? err.message : "Ocurrió un error inesperado.";
  return `<div style="padding:20px;border:1px solid ${C.risk}55;background:${C.risk}18;border-radius:12px;color:${C.text};font-size:14px;">
    <strong>No se pudo cargar la información.</strong><br/>${msg}
  </div>`;
}

/* ---------------------------------------------------------
   SIDEBAR / TOPBAR (compartidos, navegación real entre .html)
--------------------------------------------------------- */
const NAV_ITEMS = [
  { key: "dashboard", label: "Panel", icon: "dashboard", href: "dashboard.html" },
  { key: "projects", label: "Proyectos", icon: "folder", href: "projects.html" },
  { key: "chat", label: "Chat", icon: "message", href: "chat.html" },
  { key: "calendar", label: "Calendario", icon: "calendar", href: "calendar.html" },
  { key: "notifications", label: "Notificaciones", icon: "bell", href: "notifications.html" },
];

// "Equipo" (gestión de usuarios/roles/miembros) solo existe para quien puede
// administrar personas: Administrador (global) y Líder (sus proyectos).
function navItemsForRole(rolCodigo) {
  const items = [...NAV_ITEMS];
  if (rolCodigo === "ADMIN" || rolCodigo === "LIDER") {
    items.splice(2, 0, { key: "team", label: "Equipo", icon: "user", href: "team.html" });
  }
  return items;
}

function renderSidebar(activeKey, unreadCount = 0) {
  const session = getSession();
  const rolCodigo = session ? session.usuario.rol_codigo : null;
  const items = navItemsForRole(rolCodigo).map((it) => `
    <a class="nav-item ${activeKey === it.key ? "active" : ""}" href="${it.href}">
      ${icon(it.icon, { size: 17 })}<span>${it.label}</span>
      ${it.key === "notifications" && unreadCount > 0 ? `<span class="nav-badge">${unreadCount}</span>` : ""}
    </a>`).join("");
  return `
    <div class="sidebar-logo"><div class="sidebar-logo-icon">${icon("folder", { size: 16, color: C.bg })}</div><span>ProjectFlow</span></div>
    <nav class="sidebar-nav">${items}</nav>
    <div>
      <p class="sidebar-status-label">Estado del sistema</p>
      <div class="sidebar-status" id="system-status">${pulseDot(C.neutral)} Verificando conexión con el servidor…</div>
    </div>
    <div class="sidebar-footer"><a class="logout-btn" href="#" onclick="logout();return false;">${icon("logout", { size: 17 })}Cerrar sesión</a></div>`;
}

function renderTopbar(title, subtitle) {
  const session = getSession();
  const nombre = session ? session.usuario.nombre : "?";
  return `
    <div><h1>${title}</h1><p>${subtitle}</p></div>
    <div class="topbar-right">
      <div class="search-box">${icon("search", { size: 15, color: C.sub })}<input placeholder="Buscar proyectos o tareas…" /></div>
      ${avatar(nombre, 34)}
    </div>`;
}

function initShell(activeKey, title, subtitle) {
  document.getElementById("sidebar-slot").innerHTML = renderSidebar(activeKey);
  document.getElementById("topbar-slot").innerHTML = renderTopbar(title, subtitle);
  checkBackendStatus();
  renderVerificationBanner();
}

function renderVerificationBanner() {
  const session = getSession();
  const existente = document.getElementById("verify-banner");
  if (existente) existente.remove();
  if (!session || session.usuario.correo_verificado) return;

  const topbar = document.getElementById("topbar-slot");
  if (!topbar) return;
  topbar.insertAdjacentHTML("afterend", `
    <div id="verify-banner" style="background:${C.accent}18;border-bottom:1px solid ${C.accent}55;color:${C.text};font-size:13px;padding:8px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <span>Verifica tu correo (${session.usuario.correo}) para asegurar tu cuenta.</span>
      <button class="btn-ghost" style="padding:4px 10px;flex-shrink:0" onclick="reenviarVerificacion(this)">Reenviar correo</button>
    </div>`);
}

async function reenviarVerificacion(btn) {
  btn.disabled = true;
  const original = btn.textContent;
  try {
    await api.auth.resendVerification();
    btn.textContent = "Enviado ✓";
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function checkBackendStatus() {
  const el = document.getElementById("system-status");
  if (!el) return;
  try {
    await api.estados.getAll();
    el.innerHTML = `${pulseDot(C.success)} Conectado al servidor`;
  } catch (err) {
    el.innerHTML = `${pulseDot(C.risk)} Sin conexión con el backend`;
    el.title = err.message;
  }
}

async function refreshSidebarBadge(activeKey) {
  let unread = 0;
  try {
    unread = (await api.notificaciones.getAll()).filter((n) => !n.leida).length;
  } catch { /* si falla, mostramos 0 */ }
  document.getElementById("sidebar-slot").innerHTML = renderSidebar(activeKey, unread);
  checkBackendStatus();
}

/* ---------------------------------------------------------
   DASHBOARD (dashboard.html)
--------------------------------------------------------- */
function statCard(label, value, iconName, color, hint) {
  return `<div class="stat-card">
    <div class="stat-card-top"><span>${label}</span><div class="stat-icon" style="background:${color}18">${icon(iconName, { size: 16, color })}</div></div>
    <div class="stat-value">${value}</div><span class="stat-hint">${hint}</span>
  </div>`;
}

/* Gráfico de tareas por estado (dato real vía /api/tareas/stats/estado) */
function taskStatsBarSVG(stats) {
  const w = 560, h = 200, pad = 28;
  const max = Math.max(1, ...stats.map((d) => d.total_tareas)) * 1.2;
  const barW = (w - pad * 2) / stats.length - 16;
  const bars = stats.map((d, i) => {
    const x = pad + i * ((w - pad * 2) / stats.length) + 8;
    const barH = (d.total_tareas / max) * (h - pad * 2);
    const y = h - pad - barH;
    return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${statusColor(d.nombre_estado)}"/>
      <text x="${x + barW / 2}" y="${h - pad + 16}" font-size="11" fill="${C.sub}" text-anchor="middle">${d.nombre_estado}</text>
      <text x="${x + barW / 2}" y="${y - 6}" font-size="12" fill="${C.text}" text-anchor="middle">${d.total_tareas}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="display:block">${bars}</svg>`;
}

/* Helpers compartidos por los 3 paneles (admin/líder/colaborador) */
function agruparTareasPorEstado(tareas, estados) {
  return estados.map((e) => ({
    nombre_estado: e.nombre_estado,
    total_tareas: tareas.filter((t) => t.id_estado === e.id_estado).length,
  }));
}

function miniProjectCardsHTML(proyectos, avanceMap) {
  const html = proyectos.map((p) => {
    const av = avanceMap[p.id_proyecto];
    const pct = av ? Math.round(av.porcentaje_avance || 0) : 0;
    return `
    <a class="mini-card" href="project.html?id=${p.id_proyecto}">
      <div class="mini-card-top"><div class="left">${pulseDot(projectColor(p.id_proyecto))}<span>${p.nombre}</span></div><span class="pct">${pct}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${projectColor(p.id_proyecto)}"></div></div>
    </a>`;
  }).join("");
  return html || `<p style="font-size:14px;color:${C.sub}">Todavía no hay proyectos.</p>`;
}

function proximosVencimientosHTML(tareas) {
  const today = new Date();
  const upcoming = tareas
    .filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado")
    .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
    .slice(0, 5);
  return upcoming.length
    ? upcoming.map((t) => `<div class="upcoming-item">${pulseDot(statusColor(t.estado))}<div><p>${t.titulo}</p><span>${t.fecha_limite.slice(0, 10)} · ${(t.responsable || "").split(" ")[0]}</span></div></div>`).join("")
    : `<p style="font-size:14px;color:${C.sub}">No hay tareas próximas.</p>`;
}

function avanceMapDe(avanceList) {
  const avanceMap = {};
  avanceList.forEach((a) => (avanceMap[a.id_proyecto] = a));
  return avanceMap;
}

/* ---------------------------------------------------------
   PANEL — Administrador: vista global de todo el sistema
--------------------------------------------------------- */
function adminDashboardHTML({ proyectos, avanceList, tareas, estados, usuarios }) {
  const avanceMap = avanceMapDe(avanceList);
  const today = new Date();
  const overdue = tareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado" && new Date(t.fecha_limite) < today).length;
  const estadoStats = agruparTareasPorEstado(tareas, estados);

  return `
    <div class="stat-grid">
      ${statCard("Usuarios totales", usuarios.length, "user", C.purple, "Todos los roles")}
      ${statCard("Proyectos totales", proyectos.length, "folder", C.info, "En toda la organización")}
      ${statCard("Tareas vencidas", overdue, "alert", C.risk, "Requieren atención")}
      ${statCard("Tareas totales", tareas.length, "check", C.success, "Todos los proyectos")}
    </div>
    <div class="dash-grid">
      <div class="panel"><div class="panel-head"><h2>Tareas por estado</h2><span class="trend">${icon("trending", { size: 14, color: C.info })} datos en vivo</span></div>${tareas.length ? taskStatsBarSVG(estadoStats) : `<p style="font-size:14px;color:${C.sub}">Sin tareas registradas todavía.</p>`}</div>
      <div class="panel"><div class="panel-head"><h2>Próximos vencimientos</h2></div>${proximosVencimientosHTML(tareas)}</div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Todos los proyectos</h2><a class="link-sub" style="color:${C.accent};font-weight:600" href="team.html">Gestionar equipo</a></div>
      <div class="projects-mini">${miniProjectCardsHTML(proyectos, avanceMap)}</div>
    </div>`;
}

/* ---------------------------------------------------------
   PANEL — Líder de Proyecto: salud de sus proyectos + su equipo
--------------------------------------------------------- */
function liderDashboardHTML({ proyectos, avanceList, tareas, estados, invitacionesPendientes }) {
  const avanceMap = avanceMapDe(avanceList);
  const today = new Date();
  const overdue = tareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado" && new Date(t.fecha_limite) < today).length;
  const pending = tareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado").length;
  const estadoStats = agruparTareasPorEstado(tareas, estados);

  return `
    <div class="stat-grid">
      ${statCard("Mis proyectos", proyectos.length, "folder", C.info, "Como líder o miembro")}
      ${statCard("Tareas pendientes", pending, "circle", C.accent, "En mis proyectos")}
      ${statCard("Tareas vencidas", overdue, "alert", C.risk, "Requieren atención")}
      ${statCard("Invitaciones pendientes", invitacionesPendientes.length, "mail", C.purple, "Esperando respuesta")}
    </div>
    <div class="dash-grid">
      <div class="panel"><div class="panel-head"><h2>Tareas por estado</h2></div>${tareas.length ? taskStatsBarSVG(estadoStats) : `<p style="font-size:14px;color:${C.sub}">Sin tareas registradas todavía.</p>`}</div>
      <div class="panel"><div class="panel-head"><h2>Próximos vencimientos</h2></div>${proximosVencimientosHTML(tareas)}</div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Mis proyectos</h2><button class="btn-accent" onclick="window.location.href='projects.html'">${icon("plus", { size: 16 })}Nuevo proyecto</button></div>
      <div class="projects-mini">${miniProjectCardsHTML(proyectos, avanceMap)}</div>
    </div>`;
}

/* ---------------------------------------------------------
   PANEL — Colaborador: solo sus tareas asignadas, sin controles
   de administración (no crea proyectos ni gestiona gente).
--------------------------------------------------------- */
function colaboradorDashboardHTML({ proyectos, tareas, estados, usuarioId }) {
  const misTareas = tareas.filter((t) => t.id_responsable === usuarioId);
  const today = new Date();
  const pending = misTareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado").length;
  const overdue = misTareas.filter((t) => t.estado !== "Finalizado" && t.estado !== "Cancelado" && new Date(t.fecha_limite) < today).length;
  const finalizadas = misTareas.filter((t) => t.estado === "Finalizado").length;
  const estadoStats = agruparTareasPorEstado(misTareas, estados);

  const listaTareasHTML = misTareas.length
    ? misTareas
        .sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
        .map((t) => `
        <a class="task-card" href="project.html?id=${t.id_proyecto}" style="display:block;text-decoration:none">
          <div class="task-card-top">${badge(t.prioridad, priorityColor(t.prioridad))}${badge(t.estado, statusColor(t.estado))}</div>
          <p class="task-title">${t.titulo}</p>
          <div class="task-card-bottom"><div class="task-due">${icon("clock", { size: 12 })}${(t.fecha_limite || "").slice(0, 10)}</div><span style="font-size:12px;color:${C.sub}">${t.proyecto}</span></div>
        </a>`)
        .join("")
    : `<p style="font-size:14px;color:${C.sub}">No tienes tareas asignadas todavía.</p>`;

  return `
    <div class="stat-grid">
      ${statCard("Mis tareas pendientes", pending, "circle", C.accent, "Asignadas a ti")}
      ${statCard("Mis tareas vencidas", overdue, "alert", C.risk, "Requieren atención")}
      ${statCard("Mis tareas finalizadas", finalizadas, "check", C.success, "Total histórico")}
      ${statCard("Mis proyectos", proyectos.length, "folder", C.info, "Donde participas")}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Mis tareas</h2></div>
      ${misTareas.length ? taskStatsBarSVG(estadoStats) : ""}
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Todas mis tareas asignadas</h2></div>
      <div class="tasks-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">${listaTareasHTML}</div>
    </div>`;
}

/* ---------------------------------------------------------
   EQUIPO (team.html) — gestión de usuarios/roles (admin) y
   miembros/invitaciones por proyecto (líder)
--------------------------------------------------------- */
function adminTeamPageHTML(usuarios, roles) {
  const roleOptions = (current) =>
    roles.map((r) => `<option value="${r.id_rol}" ${r.id_rol === current ? "selected" : ""}>${r.nombre_rol}</option>`).join("");
  const rows = usuarios.map((u) => `
    <div class="team-row" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid ${C.border}">
      ${avatar(u.nombre, 28)}
      <div style="flex:1;min-width:0">
        <p style="margin:0;font-size:14px">${u.nombre}</p>
        <span style="font-size:12px;color:${C.sub}">${u.correo}</span>
      </div>
      <select onchange="cambiarRolUsuario(${u.id_usuario}, this.value)">${roleOptions(u.id_rol)}</select>
    </div>`).join("");
  return `
    <div class="panel">
      <div class="panel-head"><h2>Usuarios y roles</h2><span style="font-size:12px;color:${C.sub}">${usuarios.length} usuario(s)</span></div>
      ${rows || `<p style="color:${C.sub}">No hay usuarios todavía.</p>`}
    </div>`;
}

function liderTeamProjectCardHTML(proyecto, miembros) {
  const rows = miembros.map((m) => `
    <div class="team-row" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid ${C.border}">
      ${avatar(m.nombre, 26)}
      <div style="flex:1;min-width:0"><p style="margin:0;font-size:14px">${m.nombre}</p><span style="font-size:12px;color:${C.sub}">${m.correo}</span></div>
      <select onchange="cambiarRolMiembro(${proyecto.id_proyecto}, ${m.id_usuario}, this.value)">
        <option value="colaborador" ${m.rol_proyecto === "colaborador" ? "selected" : ""}>Colaborador</option>
        <option value="lider" ${m.rol_proyecto === "lider" ? "selected" : ""}>Líder</option>
      </select>
      <button class="btn-ghost" title="Quitar del proyecto" onclick="quitarMiembro(${proyecto.id_proyecto}, ${m.id_usuario})">${icon("x", { size: 14 })}</button>
    </div>`).join("");
  return `
    <div class="panel" style="margin-bottom:16px">
      <div class="panel-head"><h2>${proyecto.nombre}</h2><button class="btn-ghost" onclick="abrirInvitar(${proyecto.id_proyecto})">${icon("plus", { size: 14 })}Invitar</button></div>
      ${rows}
      <div id="invite-slot-${proyecto.id_proyecto}"></div>
    </div>`;
}

function invitarFormularioHTML(idProyecto) {
  return `
  <form class="form-card" onsubmit="enviarInvitacion(event, ${idProyecto})">
    <h3>Invitar a este proyecto</h3>
    <label>Correo<input type="email" name="correo" required placeholder="persona@correo.com" /></label>
    <label>Rol en el proyecto
      <select name="rol_proyecto">
        <option value="colaborador">Colaborador</option>
        <option value="lider">Líder</option>
      </select>
    </label>
    <div class="form-actions">
      <button type="button" class="btn-ghost" onclick="cerrarInvitar(${idProyecto})">Cancelar</button>
      <button type="submit" class="btn-accent">Generar invitación</button>
    </div>
    <p class="form-error" id="invite-error-${idProyecto}"></p>
    <div id="invite-result-${idProyecto}"></div>
  </form>`;
}

/* ---------------------------------------------------------
   PROYECTOS (projects.html)
--------------------------------------------------------- */
function projectsPageHTML(proyectos, avanceList, tareas, puedeCrear) {
  const avanceMap = {};
  avanceList.forEach((a) => (avanceMap[a.id_proyecto] = a));
  const cards = proyectos.map((p) => {
    const av = avanceMap[p.id_proyecto];
    const pct = av ? Math.round(av.porcentaje_avance || 0) : 0;
    const total = av ? av.total_tareas : tareas.filter((t) => t.id_proyecto === p.id_proyecto).length;
    const done = av ? av.tareas_finalizadas : 0;
    return `
    <a class="project-card" href="project.html?id=${p.id_proyecto}">
      <div class="project-card-top"><div class="left">${pulseDot(projectColor(p.id_proyecto), 9)}<span>${p.nombre}</span></div>${badge(p.estado, statusColor(p.estado))}</div>
      <p class="project-client">${p.descripcion || "Sin descripción"}</p>
      <div><div class="progress-row"><span>${done}/${total} tareas</span><span>${pct}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${projectColor(p.id_proyecto)}"></div></div></div>
      <div class="card-footer">${avatar(p.responsable, 26)}<span class="due-text">${p.fecha_fin ? "Vence " + p.fecha_fin.slice(0, 10) : "Sin fecha límite"}</span></div>
    </a>`;
  }).join("");
  const nuevoBtn = puedeCrear
    ? `<button class="btn-accent" onclick="openNewProjectForm()">${icon("plus", { size: 16 })}Nuevo proyecto</button>`
    : "";
  return `
    <div class="projects-head"><p>${proyectos.length} proyectos en total</p>${nuevoBtn}</div>
    <div id="new-project-slot"></div>
    <div class="projects-grid">${cards || `<p style="color:${C.sub}">Todavía no hay proyectos.</p>`}</div>`;
}

function newProjectFormHTML(estados) {
  const estadoOptions = estados.map((e) => `<option value="${e.id_estado}">${e.nombre_estado}</option>`).join("");
  return `
  <form class="form-card" id="new-project-form" onsubmit="submitNewProject(event)">
    <h3>Nuevo proyecto</h3>
    <label>Nombre<input name="nombre" required maxlength="100" /></label>
    <label>Descripción<input name="descripcion" maxlength="255" /></label>
    <div class="form-row">
      <label>Fecha de inicio<input type="date" name="fecha_inicio" required /></label>
      <label>Fecha de fin<input type="date" name="fecha_fin" /></label>
      <label>Estado<select name="id_estado" required>${estadoOptions}</select></label>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-ghost" onclick="closeNewProjectForm()">Cancelar</button>
      <button type="submit" class="btn-accent">Crear proyecto</button>
    </div>
    <p class="form-error" id="new-project-error"></p>
  </form>`;
}

/* ---------------------------------------------------------
   DETALLE DE PROYECTO — KANBAN (project.html?id=N)
--------------------------------------------------------- */
function taskCardHTML(t) {
  return `
  <button class="task-card" onclick="openTask(${t.id_tarea})">
    <div class="task-card-top">${badge(t.prioridad, priorityColor(t.prioridad))}</div>
    <p class="task-title">${t.titulo}</p>
    <div class="task-card-bottom">
      <div class="task-due">${icon("clock", { size: 12 })}${(t.fecha_limite || "").slice(5, 10)}</div>
      <div class="task-right">${avatar(t.responsable, 22)}</div>
    </div>
  </button>`;
}

function miembrosPanelHTML(miembros, puedeGestionar, idProyecto, idUsuarioActual) {
  const avatares = miembros
    .map((m) => {
      const esYo = m.id_usuario === idUsuarioActual;
      const titulo = `${m.nombre} (${m.rol_proyecto === "lider" ? "líder" : "colaborador"})${esYo ? "" : " — clic para enviarle un mensaje"}`;
      const onclick = esYo ? "" : ` onclick="window.location.href='chat.html?usuario=${m.id_usuario}'" style="cursor:pointer"`;
      return `<div title="${titulo}"${onclick}>${avatar(m.nombre, 26)}</div>`;
    })
    .join("");
  const inviteBtn = puedeGestionar
    ? `<button class="btn-ghost" onclick="openInviteForm()">${icon("plus", { size: 14 })}Invitar</button>`
    : "";
  return `
    <div class="project-members-row" style="display:flex;align-items:center;gap:8px;margin:12px 0 20px">
      <div style="display:flex;gap:4px">${avatares}</div>
      <span style="font-size:13px;color:${C.sub}">${miembros.length} miembro(s)</span>
      <a class="btn-ghost" href="chat.html?proyecto=${idProyecto}">${icon("message", { size: 14 })}Chat del proyecto</a>
      <a class="btn-ghost" href="videollamada.html?proyecto=${idProyecto}">${icon("video", { size: 14 })}Videollamada</a>
      <a class="btn-ghost" href="assistant.html?proyecto=${idProyecto}">${icon("trending", { size: 14 })}Asistente IA</a>
      ${inviteBtn}
    </div>
    <div id="invite-form-slot"></div>`;
}

function inviteFormHTML(idProyecto) {
  return `
  <form class="form-card" id="invite-form" onsubmit="submitInvite(event, ${idProyecto})">
    <h3>Invitar a este proyecto</h3>
    <label>Correo<input type="email" name="correo" required placeholder="persona@correo.com" /></label>
    <label>Rol en el proyecto
      <select name="rol_proyecto">
        <option value="colaborador">Colaborador</option>
        <option value="lider">Líder</option>
      </select>
    </label>
    <div class="form-actions">
      <button type="button" class="btn-ghost" onclick="closeInviteForm()">Cancelar</button>
      <button type="submit" class="btn-accent">Generar invitación</button>
    </div>
    <p class="form-error" id="invite-error"></p>
    <div id="invite-result"></div>
  </form>`;
}

function inviteResultHTML(enlace) {
  return `
    <div class="panel" style="margin-top:12px;padding:12px">
      <p style="font-size:13px;margin:0 0 8px">Comparte este enlace con la persona invitada (válido por 7 días):</p>
      <div style="display:flex;gap:8px">
        <input readonly value="${enlace}" style="flex:1" onclick="this.select()" />
        <button type="button" class="btn-accent" onclick="navigator.clipboard.writeText('${enlace}')">Copiar</button>
      </div>
    </div>`;
}

function projectDetailInnerHTML(proyecto, tareas, estados, miembros, puedeGestionar, idUsuarioActual) {
  if (!proyecto) return `<p>Proyecto no encontrado.</p>`;
  const addTaskBtn = (idEstado) => puedeGestionar
    ? `<button class="add-task-btn" onclick="openNewTaskForm(${idEstado})">${icon("plus", { size: 14 })}Añadir tarea</button>`
    : "";
  const columns = estados.map((estado) => {
    const colTasks = tareas.filter((t) => t.id_estado === estado.id_estado);
    return `
    <div class="kanban-col">
      <div class="kanban-col-head"><div class="left">${pulseDot(statusColor(estado.nombre_estado))}<span class="title">${estado.nombre_estado}</span><span class="kanban-count">${colTasks.length}</span></div></div>
      <div class="kanban-body">${colTasks.map(taskCardHTML).join("")}${addTaskBtn(estado.id_estado)}</div>
    </div>`;
  }).join("");
  return `
    <a class="back-link" href="projects.html">${icon("chevronLeft", { size: 16 })}Volver a proyectos</a>
    <div class="project-detail-title">${pulseDot(projectColor(proyecto.id_proyecto), 10)}<h2>${proyecto.nombre}</h2><span>· ${proyecto.responsable}</span></div>
    ${miembrosPanelHTML(miembros, puedeGestionar, proyecto.id_proyecto, idUsuarioActual)}
    <div class="kanban">${columns}</div>
    <div id="new-task-slot"></div>`;
}

function newTaskFormHTML(idProyecto, estados, prioridades, usuarios, defaultEstado) {
  const estadoOptions = estados.map((e) => `<option value="${e.id_estado}" ${e.id_estado === defaultEstado ? "selected" : ""}>${e.nombre_estado}</option>`).join("");
  const prioridadOptions = prioridades.map((p) => `<option value="${p.id_prioridad}">${p.nombre_prioridad}</option>`).join("");
  const userOptions = usuarios.map((u) => `<option value="${u.id_usuario}">${u.nombre}</option>`).join("");
  return `
  <form class="form-card" id="new-task-form" onsubmit="submitNewTask(event, ${idProyecto})">
    <h3>Nueva tarea</h3>
    <label>Título<input name="titulo" required maxlength="100" /></label>
    <label>Descripción<input name="descripcion" maxlength="255" /></label>
    <div class="form-row">
      <label>Fecha inicio<input type="date" name="fecha_inicio" required /></label>
      <label>Fecha límite<input type="date" name="fecha_limite" required /></label>
    </div>
    <div class="form-row">
      <label>Prioridad<select name="id_prioridad" required>${prioridadOptions}</select></label>
      <label>Estado<select name="id_estado" required>${estadoOptions}</select></label>
      <label>Responsable<select name="id_responsable" required>${userOptions}</select></label>
    </div>
    <div class="form-actions">
      <button type="button" class="btn-ghost" onclick="closeNewTaskForm()">Cancelar</button>
      <button type="submit" class="btn-accent">Crear tarea</button>
    </div>
    <p class="form-error" id="new-task-error"></p>
  </form>`;
}

function taskModalHTML(t, estados, puedeGestionar) {
  if (!t) return "";
  const pills = estados.map((e) => {
    const on = t.id_estado === e.id_estado, c = statusColor(e.nombre_estado);
    return `<button class="status-pill" style="border-color:${on ? c : C.border};color:${on ? c : C.sub};background:${on ? c + "18" : "transparent"}" onclick="setTaskStatus(${t.id_tarea},${e.id_estado})">${e.nombre_estado}</button>`;
  }).join("");
  const eliminarBtn = puedeGestionar
    ? `<div class="form-actions"><button class="btn-danger" onclick="deleteTask(${t.id_tarea})">${icon("trash", { size: 14 })}Eliminar tarea</button></div>`
    : "";
  return `
  <div class="modal-overlay" onclick="if(event.target===this) closeTask()">
    <div class="modal">
      <div class="modal-head"><div>${badge(t.prioridad, priorityColor(t.prioridad))}<h2>${t.titulo}</h2></div><button onclick="closeTask()">${icon("x", { size: 18, color: C.sub })}</button></div>
      <div class="modal-grid">
        <div><p class="modal-label">Responsable</p><div class="modal-row">${avatar(t.responsable, 22)}<span>${t.responsable}</span></div></div>
        <div><p class="modal-label">Vence</p><span>${(t.fecha_limite || "").slice(0, 10)}</span></div>
      </div>
      ${t.descripcion ? `<div style="margin-bottom:20px"><p class="modal-label">Descripción</p><p style="font-size:14px;margin:0">${t.descripcion}</p></div>` : ""}
      <div style="margin-bottom:20px"><p class="modal-label">Estado</p><div class="status-pills">${pills}</div></div>
      ${eliminarBtn}
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   CALENDARIO (calendar.html)
--------------------------------------------------------- */
const MONTH_NAMES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const WEEKDAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

function calendarInnerHTML(cursor, selectedDay, eventos) {
  const year = cursor.getFullYear(), month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;
  const byDay = {};
  eventos.forEach((ev) => {
    const d = new Date(ev.fecha);
    if (d.getUTCFullYear() === year && d.getUTCMonth() === month) {
      const day = d.getUTCDate();
      byDay[day] = byDay[day] || [];
      byDay[day].push(ev);
    }
  });
  let cells = "";
  for (let i = 0; i < startOffset; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = byDay[d] || [];
    const dots = dayEvents.slice(0, 3).map(() => `<span style="background:${C.accent}"></span>`).join("");
    cells += `<button class="cal-day ${d === selectedDay ? "selected" : ""}" onclick="calSelectDay(${d})">${d}${dayEvents.length ? `<div class="cal-day-dots">${dots}</div>` : ""}</button>`;
  }
  const selEvents = byDay[selectedDay] || [];
  const selHTML = selEvents.length
    ? selEvents.map((ev) => `<div class="day-task-card">
        <div class="day-task-top">${badge(ev.hora, C.accent)}${ev.proyecto ? badge(ev.proyecto, C.info) : ""}</div>
        <p class="day-task-title">${ev.titulo}</p>
        ${ev.descripcion ? `<p style="font-size:12px;color:${C.sub};margin:4px 0 0">${ev.descripcion}</p>` : ""}
      </div>`).join("")
    : `<p style="font-size:14px;color:${C.sub}">Sin eventos para este día.</p>`;
  return `
    <div class="calendar-grid">
      <div class="panel">
        <div class="cal-head"><h2>${monthLabel}</h2><div class="cal-nav"><button onclick="calShift(-1)">${icon("chevronLeft", { size: 16, color: C.sub })}</button><button onclick="calShift(1)">${icon("chevronRight", { size: 16, color: C.sub })}</button></div></div>
        <div class="cal-weekdays">${WEEKDAYS.map((d) => `<div>${d}</div>`).join("")}</div>
        <div class="cal-days">${cells}</div>
      </div>
      <div class="panel"><div class="panel-head"><h2>${selectedDay ? `${selectedDay} de ${monthLabel}` : "Selecciona un día"}</h2></div>${selHTML}</div>
    </div>`;
}

/* ---------------------------------------------------------
   NOTIFICACIONES (notifications.html)
   Notificaciones reales, generadas y persistidas por el servidor
   (tabla Notificaciones): invitaciones, cambios de rol, tareas
   asignadas, tareas/eventos por vencer (cron diario).
--------------------------------------------------------- */
const NOTIF_META = {
  invitacion: { icon: "mail", color: C.purple },
  rol_cambiado: { icon: "user", color: C.info },
  tarea_asignada: { icon: "clock", color: C.accent },
  tarea_vencida: { icon: "alert", color: C.risk },
  evento: { icon: "calendar", color: C.info },
};
function notificationsInnerHTML(notificaciones) {
  const unread = notificaciones.filter((n) => !n.leida).length;
  const items = notificaciones.length
    ? notificaciones.map((n) => {
        const meta = NOTIF_META[n.tipo] || { icon: "bell", color: C.neutral };
        const abrir = n.enlace ? `abrirNotificacion(${n.id_notificacion}, '${n.enlace}')` : `markRead(${n.id_notificacion})`;
        return `
        <button class="notif-item ${!n.leida ? "unread" : ""}" onclick="${abrir}">
          <div class="notif-icon" style="background:${meta.color}18">${icon(meta.icon, { size: 15, color: meta.color })}</div>
          <div style="flex:1"><p class="notif-text">${n.titulo}${n.mensaje ? " — " + n.mensaje : ""}</p><p class="notif-time">${new Date(n.creada_en).toLocaleString()}</p></div>
          ${!n.leida ? pulseDot(C.accent) : ""}
        </button>`;
      }).join("")
    : `<p style="font-size:14px;color:${C.sub}">No hay novedades por ahora.</p>`;
  return `
    <div class="notif-head"><p>${unread} sin leer</p><button class="mark-all" onclick="markAllRead()">Marcar todas como leídas</button></div>
    <div class="notif-list">${items}</div>`;
}
