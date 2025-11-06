import nodemailer from 'nodemailer';
import BrevoTransport from 'nodemailer-brevo-transport';
import { NODE_ENV } from '../config/config.js';

export const sendEmail = async ({ to, subject, text, html }) => {
    let transporter;

    if (NODE_ENV === 'production') {
        console.log('in production' + process.env.BREVO_API_KEY);
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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info)); // works for dev/test
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
};
