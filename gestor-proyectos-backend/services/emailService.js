const nodemailer = require("nodemailer");

// Gmail como servidor SMTP: al salir desde @gmail.com, Google ya resuelve su
// propio SPF/DKIM/DMARC — no hace falta dominio propio. Requiere que
// GMAIL_USER tenga verificación en 2 pasos y una "contraseña de aplicación"
// (myaccount.google.com/apppasswords) en GMAIL_APP_PASSWORD, NUNCA la
// contraseña normal de la cuenta.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM_NAME = process.env.GMAIL_SENDER_NAME || "ProjectFlow";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5500").replace(/\/$/, "");

const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        // Algunos hosts (Render incluido) anuncian IPv6 pero no tienen salida
        // IPv6 real, y la conexión a Gmail falla con ENETUNREACH. Forzar IPv4
        // evita ese problema.
        family: 4,
      })
    : null;

// El correo es "best effort": si falta configuración o el envío falla
// (límite diario de Gmail, credenciales inválidas, etc.) esto NUNCA debe
// tumbar el flujo que lo llamó (registro, invitación, cron) — solo se loguea.
async function enviarCorreo({ to, subject, html }) {
  if (!transporter) {
    console.log(`[emailService] GMAIL_USER/GMAIL_APP_PASSWORD no configurados — correo no enviado a ${to}: "${subject}"`);
    return { enviado: false, motivo: "sin_configurar" };
  }
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { enviado: true };
  } catch (err) {
    console.error(`[emailService] No se pudo enviar correo a ${to}:`, err.message);
    return { enviado: false, motivo: err.message };
  }
}

exports.enviarVerificacion = (usuario, token) =>
  enviarCorreo({
    to: usuario.correo,
    subject: "Verifica tu correo — ProjectFlow",
    html: `
      <p>Hola ${usuario.nombre},</p>
      <p>Confirma tu correo en ProjectFlow haciendo clic en el siguiente enlace:</p>
      <p><a href="${FRONTEND_URL}/verify-email.html?token=${token}">Verificar mi correo</a></p>
      <p>Si tú no creaste esta cuenta, ignora este mensaje.</p>
    `,
  });

exports.enviarInvitacion = (correoDestino, { proyectoNombre, invitadorNombre, token }) =>
  enviarCorreo({
    to: correoDestino,
    subject: `${invitadorNombre} te invitó a "${proyectoNombre}" en ProjectFlow`,
    html: `
      <p>${invitadorNombre} te invitó a colaborar en el proyecto "${proyectoNombre}" en ProjectFlow.</p>
      <p><a href="${FRONTEND_URL}/invite-accept.html?token=${token}">Ver invitación y unirme</a></p>
      <p>Este enlace vence en 7 días.</p>
    `,
  });

exports.enviarDigestoVencimientos = (usuario, items) =>
  enviarCorreo({
    to: usuario.correo,
    subject: `Tienes ${items.length} pendiente(s) en ProjectFlow`,
    html: `
      <p>Hola ${usuario.nombre}, esto es lo que se acerca o ya venció:</p>
      <ul>${items.map((texto) => `<li>${texto}</li>`).join("")}</ul>
      <p><a href="${FRONTEND_URL}/notifications.html">Ver todas mis notificaciones</a></p>
    `,
  });
