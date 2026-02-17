// src/services/email.service.js
const nodemailer = require('nodemailer');

// TEMPORARY: Hardcoded for testing (will move back to .env after testing)
const EMAIL_USER = 'tarunchandradas91@gmail.com';
const EMAIL_PASSWORD = 'kwimvtepxtbkazni';

// Debug: Log if email config is loaded
console.log('📧 Email Config Loaded:');
console.log('   EMAIL_USER:', EMAIL_USER ? `${EMAIL_USER.substring(0, 5)}...` : '❌ NOT SET');
console.log('   EMAIL_PASSWORD:', EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');

// Configure email transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
    }
});

// In-memory OTP storage (for production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send password reset OTP
exports.sendPasswordResetOTP = async (email) => {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP with expiry
    otpStore.set(email, { otp, expiresAt });

    const mailOptions = {
        from: `"Pothik Travel" <${EMAIL_USER}>`,
        to: email,
        subject: 'Pothik - Password Reset OTP',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">Pothik</h1>
                    <p style="color: #64748b; margin: 5px 0;">Your Travel Companion</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center; color: white;">
                    <h2 style="margin: 0 0 10px 0; font-weight: 600;">Password Reset Request</h2>
                    <p style="margin: 0; opacity: 0.9;">Use the OTP below to reset your password</p>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">Your One-Time Password</p>
                    <div style="background: white; border: 2px dashed #2563eb; border-radius: 8px; padding: 20px; display: inline-block;">
                        <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">${otp}</span>
                    </div>
                    <p style="color: #ef4444; margin: 15px 0 0 0; font-size: 13px;">
                        ⏱️ This OTP will expire in <strong>10 minutes</strong>
                    </p>
                </div>
                
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 15px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account is safe.
                    </p>
                </div>
                
                <div style="text-align: center; color: #94a3b8; font-size: 12px;">
                    <p style="margin: 0;">© ${new Date().getFullYear()} Pothik Travel. All rights reserved.</p>
                    <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        throw new Error('Failed to send OTP email. Please try again.');
    }
};

// Verify OTP
exports.verifyOTP = (email, otp) => {
    const stored = otpStore.get(email);

    if (!stored) {
        throw new Error('OTP not found. Please request a new one.');
    }

    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        throw new Error('OTP has expired. Please request a new one.');
    }

    if (stored.otp !== otp) {
        throw new Error('Invalid OTP. Please check and try again.');
    }

    // Clear OTP after successful verification
    otpStore.delete(email);
    return true;
};

// Clear expired OTPs (cleanup function)
exports.clearExpiredOTPs = () => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiresAt) {
            otpStore.delete(email);
        }
    }
};
