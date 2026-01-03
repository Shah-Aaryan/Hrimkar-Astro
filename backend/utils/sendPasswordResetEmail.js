const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendPasswordResetEmail(to, otp, firstName) {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: `"Hrimkar Astro" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset OTP - Hrimkar Astro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b21a8; text-align: center;">Hrimkar Astro</h2>
        <p>Hello ${firstName || 'there'},</p>
        <p>We received a request to reset your password. Use the OTP below to reset your password:</p>
        <div style="background: linear-gradient(135deg, #6b21a8, #9333ea); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px;">
          ${otp}
        </div>
        <p style="margin-top: 20px;">This OTP is valid for <strong>10 minutes</strong>.</p>
        <p style="color: #dc2626;"><strong>If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">© 2026 Hrimkar Astro. All rights reserved.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw error;
  }
}

module.exports = sendPasswordResetEmail;
