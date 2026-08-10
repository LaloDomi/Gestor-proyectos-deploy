const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM || "onboarding@resend.dev";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5500"
).replace(/\/$/, "");

const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null;

async function enviarCorreo({ to, subject, html }) {
  if (!resend) {
    console.log(
      `[emailService] RESEND_API_KEY no configurada — correo no enviado a ${to}: "${subject}"`
    );

    return {
      enviado: false,
      motivo: "sin_configurar",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error(
        `[emailService] Error de Resend al enviar correo a ${to}:`,
        error
      );

      return {
        enviado: false,
        motivo: error.message || "Error de Resend",
      };
    }

    console.log(
      `[emailService] Correo enviado correctamente a ${to}. ID: ${data?.id}`
    );

    return {
      enviado: true,
      id: data?.id,
    };
  } catch (err) {
    console.error(
      `[emailService] No se pudo enviar correo a ${to}:`,
      err.message
    );

    return {
      enviado: false,
      motivo: err.message,
    };
  }
}

exports.enviarVerificacion = (usuario, token) =>
  enviarCorreo({
    to: usuario.correo,
    subject: "Verifica tu correo — ProjectFlow",
    html: `
      <p>Hola ${usuario.nombre},</p>

      <p>
        Confirma tu correo en ProjectFlow haciendo clic
        en el siguiente enlace:
      </p>

      <p>
        <a href="${FRONTEND_URL}/verify-email.html?token=${token}">
          Verificar mi correo
        </a>
      </p>

      <p>
        Si tú no creaste esta cuenta, ignora este mensaje.
      </p>
    `,
  });

exports.enviarInvitacion = (
  correoDestino,
  { proyectoNombre, invitadorNombre, token }
) =>
  enviarCorreo({
    to: correoDestino,
    subject: `${invitadorNombre} te invitó a "${proyectoNombre}" en ProjectFlow`,
    html: `
      <p>
        ${invitadorNombre} te invitó a colaborar en el proyecto
        "${proyectoNombre}" en ProjectFlow.
      </p>

      <p>
        <a href="${FRONTEND_URL}/invite-accept.html?token=${token}">
          Ver invitación y unirme
        </a>
      </p>

      <p>
        Este enlace vence en 7 días.
      </p>
    `,
  });

exports.enviarDigestoVencimientos = (usuario, items) =>
  enviarCorreo({
    to: usuario.correo,
    subject: `Tienes ${items.length} pendiente(s) en ProjectFlow`,
    html: `
      <p>
        Hola ${usuario.nombre}, esto es lo que se acerca o ya venció:
      </p>

      <ul>
        ${items.map((texto) => `<li>${texto}</li>`).join("")}
      </ul>

      <p>
        <a href="${FRONTEND_URL}/notifications.html">
          Ver todas mis notificaciones
        </a>
      </p>
    `,
  });