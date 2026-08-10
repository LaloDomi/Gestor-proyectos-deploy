const nodemailer = require("nodemailer");

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const FROM_NAME = process.env.GMAIL_SENDER_NAME || "ProjectFlow";

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5500"
).replace(/\/$/, "");

const transporter =
  GMAIL_USER && GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        family: 4,
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      })
    : null;

async function enviarCorreo({ to, subject, html }) {
  if (!transporter) {
    console.log(
      `[emailService] GMAIL_USER/GMAIL_APP_PASSWORD no configurados — correo no enviado a ${to}: "${subject}"`
    );

    return {
      enviado: false,
      motivo: "sin_configurar",
    };
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    return {
      enviado: true,
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