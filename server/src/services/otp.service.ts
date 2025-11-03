import nodemailer from "nodemailer";
import config from "src/configs/_config.js";

export enum EmailType {
    VERIFY_OTP = "VERIFY_OTP",
    LOGIN_OTP = "LOGIN_OTP",
    WELCOME = "WELCOME",
    PASSWORD_RESET = "PASSWORD_RESET",
}


type EmailPayload =
    | { email: string; otp: string } // VERIFY_OTP, LOGIN_OTP
    | { email: string; name: string } // WELCOME
    | { email: string; resetLink: string }; // PASSWORD_RESET


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

const templates = {
    [EmailType.VERIFY_OTP]: (data: any) => ({
        subject: "Verify Your Email",
        text: `Your verification OTP is ${data.otp}`,
        html: `<p>Your verification OTP is <b>${data.otp}  || Exp: 5 mins</b></p>`,
    }),

    [EmailType.LOGIN_OTP]: (data: any) => ({
        subject: "Login Security OTP",
        text: `Your login OTP is ${data.otp}`,
        html: `<p>Your login OTP is <b>${data.otp}</b></p>`,
    }),

    [EmailType.WELCOME]: (data: any) => ({
        subject: "Welcome!",
        text: `Welcome ${data.name}! Your account is ready.`,
        html: `<p>Welcome <b>${data.name}</b>! 🎉 Your account is ready.</p>`,
    }),

    [EmailType.PASSWORD_RESET]: (data: any) => ({
        subject: "Reset Your Password",
        text: `Click here to reset your password: ${data.resetLink}`,
        html: `<p>Click below to reset your password:</p>
           <a href="${data.resetLink}">${data.resetLink}</a>`,
    }),
};

const emailService = {
    sendEmail: async (type: EmailType, payload: EmailPayload) => {
        const template = templates[type];
        if (!template) throw new Error("Invalid email type");

        const { subject, text, html } = template(payload);

        await transporter.sendMail({
            from: config.SMTP_USER,
            to: payload.email,
            subject,
            text,
            html,
        });
    },
};

export default emailService;
