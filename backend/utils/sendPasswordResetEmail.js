/**
 * Send Password Reset Email using Resend API
 * Works on Render free tier (no SMTP blocking issues)
 */

async function sendPasswordResetEmail(to, otp, firstName) {
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    throw new Error('Email service not configured');
  }

  const emailHtml = `
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
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Hrimkar Astro <onboarding@resend.dev>',
        to: [to],
        subject: 'Password Reset OTP - Hrimkar Astro',
        html: emailHtml
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Resend API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    console.log('Password reset email sent successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error sending password reset email:', error.message);
    throw error;
  }
}

module.exports = sendPasswordResetEmail;
