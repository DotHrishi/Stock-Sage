import nodemailer from "nodemailer";
import { NEWS_SUMMARY_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({email, name, intro}: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
    .replace('{{name}}', name)
    .replace('{{intro}}',intro)

    const mailOptions = {
        from: '"StockSage" <users@stocksage.pro>',
        to: email,
        subject: 'Welcome to StockSage! Your stock market companion is ready.',
        text: 'Thanks for joining StockSage',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    {email, date, newsContent}: {email: string; date: string; newsContent: string}): Promise<void> => {
        try {
            console.log(`Preparing email for ${email} with date: ${date}`);
            
            const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
            .replace('{{data}}', date)
            .replace('{{newsContent}}', newsContent);

            const mailOptions = {
                from: `"StockSage News" <kalihrishikesh@gmail.com>`,
                to: email,
                subject: `Market News Summary Today = ${date}`,
                text: `Today market news summary from StockSage`,
                html: htmlTemplate,
            };

            console.log(`Sending email to ${email}...`);
            const result = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${email}:`, result.messageId);
        } catch (error) {
            console.error(`Error sending email to ${email}:`, error);
            throw error;
        }
}

