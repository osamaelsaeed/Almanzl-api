import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Support <no-reply@almanzel.com>',
        to,
        subject,
        text,
        message,
    };

    await transporter.sendMail(mailOptions);
};
