import nodemailer from 'nodemailer';
import BrevoTransport from 'nodemailer-brevo-transport';
import { NODE_ENV } from '../config/config.js';

export const sendEmail = async ({ to, subject, text, html }) => {
    let transporter;

    if (NODE_ENV === 'production') {
        transporter = nodemailer.createTransport(
            new BrevoTransport({
                apiKey: process.env.BREVO_API_KEY,
            })
        );
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'Support <no-reply@almanzel.com>',
        to,
        subject,
        text,
        html,
    };

    await transporter.sendMail(mailOptions);
};
