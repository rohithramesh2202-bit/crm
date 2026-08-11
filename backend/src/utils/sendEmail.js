const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

/**
 * Send an email.
 * @param {{to: string, subject: string, html: string, attachments?: object[]}} options
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  const t = getTransporter();
  const info = await t.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || "CRM"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
  return info;
};

module.exports = sendEmail;
