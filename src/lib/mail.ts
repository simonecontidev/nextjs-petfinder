import nodemailer from "nodemailer";

type MailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendMail({ to, subject, text }: MailInput) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "PetFinder <no-reply@example.com>",
    to,
    subject,
    text,
  });
}