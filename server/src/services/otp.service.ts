import nodemailer from "nodemailer";
import config from "src/configs/_config.js";

export enum EmailType {
    VERIFY_OTP = "VERIFY_OTP",
    LOGIN_OTP = "LOGIN_OTP",
    WELCOME = "WELCOME",
    PASSWORD_RESET_OTP = "PASSWORD_RESET_OTP",

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
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Your verification code has been generated securely. Use it to complete your email verification.</p>
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Expires in 5 minutes</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.LOGIN_OTP]: (data: any) => ({
        subject: "Login Security OTP",
        text: `Your login OTP is ${data.otp}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Login Security Code</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">We've received a login attempt on your account. Use this one-time code to proceed securely.</p>
                    <div style="background-color: #fff3e0; padding: 20px; border-radius: 6px; border-left: 4px solid #ff9800; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #f57c00; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Valid for 5 minutes only</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">For your security, never share this code with anyone.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.WELCOME]: (data: any) => ({
        subject: "Welcome!",
        text: `Welcome ${data.name}! Your account is ready.`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h1 style="color: #333333; margin: 0 0 15px 0; font-size: 32px; font-weight: 700;">Welcome Aboard! 🎉</h1>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 18px; line-height: 1.5;">Hello <strong style="color: #1976d2;">${data.name}</strong>,</p>
                    <p style="color: #666666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">Your account is all set up and ready for you to dive in. We're excited to have you here!</p>
                    <div style="background-color: #e8f5e8; padding: 20px; border-radius: 6px; border-left: 4px solid #4caf50; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px; color: #2e7d32; text-align: center; font-weight: 500;">Start exploring your dashboard and unlock amazing features today.</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">Need help? Reply to this email or check our support center.</p>
                </div>
            </div>
        `,
    }),
    [EmailType.PASSWORD_RESET_OTP]: (data: any) => ({
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${data.otp}`,
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; padding: 20px; background-color: #ffffff; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                    <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">Your password reset code has been generated securely. Use it to complete your password reset.</p>
                    <div style="background-color: #e3f2fd; padding: 20px; border-radius: 6px; border-left: 4px solid #2196f3; margin: 20px 0;">
                        <p style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 4px; margin: 0; text-align: center;">${data.otp}</p>
                        <p style="color: #666666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Expires in 5 minutes</p>
                    </div>
                    <p style="color: #999999; font-size: 14px; margin: 20px 0 0 0; text-align: center;">If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `,
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
