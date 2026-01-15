/**
 * Send Password Reset Email using Brevo API (formerly Sendinblue)
 * Free 300 emails/day, no domain verification required
 */

async function sendPasswordResetEmail(to, otp, firstName) {
  // Check if Brevo API key is configured
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured');
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
    console.log('[Brevo] Attempting to send password reset email to:', to);
    console.log('[Brevo] API Key present:', !!process.env.BREVO_API_KEY);
    
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Hrimkar Astro', email: 'hrimkarastro@gmail.com' },
        to: [{ email: to }],
        subject: 'Password Reset OTP - Hrimkar Astro',
        htmlContent: emailHtml
      })
    });

    console.log('[Brevo] Response status:', response.status, response.statusText);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Brevo] API error response:', JSON.stringify(data, null, 2));
      throw new Error(data.message || data.code || 'Failed to send email');
    }

    console.log('[Brevo] Password reset email sent successfully! MessageId:', data.messageId);
    return data;
  } catch (error) {
    console.error('[Brevo] Error sending password reset email:', error.message);
    console.error('[Brevo] Full error:', error);
    throw error;
  }
}

module.exports = sendPasswordResetEmail;
