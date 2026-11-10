import nodemailer from 'nodemailer';

const configurado = Boolean(process.env.SMTP_HOST);

const transporter = configurado
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : nodemailer.createTransport({ jsonTransport: true });

export async function enviarCorreo({ to, subject, text }) {
  if (!to) return;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'gestor-incidencias@concordia.gob.ar',
    to, subject, text,
  });
  if (!configurado) console.log(`[correo simulado] ${subject} -> ${to}`);
}

export function avisarCambioEstado(incidencia, estado) {
  return enviarCorreo({
    to: incidencia.creado_por_email,
    subject: `Incidencia #${incidencia.id_incidencia} ${estado}`,
    text: [
      `Hola ${incidencia.creado_por_nombre}:`,
      '',
      `La incidencia #${incidencia.id_incidencia} fue ${estado}.`,
      `Artículo: ${incidencia.articulo}`,
      `Descripción: ${incidencia.descripcion_pedido}`,
      `Estado actual: ${incidencia.estado}`,
      incidencia.descripcion_resolucion ? `Resolución: ${incidencia.descripcion_resolucion}` : '',
      '',
      'Gestor de Incidencias - Municipalidad de Concordia',
    ].filter(Boolean).join('\n'),
  });
}
