export const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    return { otp, expiry };
};
