const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Admin email for booking notifications
const ADMIN_EMAIL = 'hrimkarastro@gmail.com';

async function sendBookingNotification(booking) {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials not configured. Skipping booking notification email.');
    return null;
  }

  const scheduledDate = new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const mailOptions = {
    from: `"Hrimkar Astro" <${process.env.EMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `New Booking Alert - ${booking.service.name} - ${booking.bookingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #6b21a8, #9333ea); padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="color: white; text-align: center; margin: 0;">🔔 New Booking Received!</h2>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #6b21a8; border-bottom: 2px solid #6b21a8; padding-bottom: 10px;">Booking Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; width: 40%;">Booking ID:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Service:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.service.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Duration:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.service.duration} minutes</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Consultation Mode:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: capitalize;">${booking.consultationMode}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Scheduled Date:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${scheduledDate}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Scheduled Time:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.scheduledTime}</td>
            </tr>
          </table>
          
          <h3 style="color: #6b21a8; border-bottom: 2px solid #6b21a8; padding-bottom: 10px;">Customer Details</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; width: 40%;">Name:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.personalDetails.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.personalDetails.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Phone:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">${booking.personalDetails.phone}</td>
            </tr>
            ${booking.personalDetails.dateOfBirth ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Date of Birth:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(booking.personalDetails.dateOfBirth).toLocaleDateString('en-IN')}</td>
            </tr>
            ` : ''}
            ${booking.personalDetails.timeOfBirth ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Time of Birth:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.personalDetails.timeOfBirth}</td>
            </tr>
            ` : ''}
            ${booking.personalDetails.placeOfBirth ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Place of Birth:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.personalDetails.placeOfBirth}</td>
            </tr>
            ` : ''}
            ${booking.personalDetails.consultationPurpose ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Consultation Purpose:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${booking.personalDetails.consultationPurpose}</td>
            </tr>
            ` : ''}
          </table>
          
          <h3 style="color: #6b21a8; border-bottom: 2px solid #6b21a8; padding-bottom: 10px;">Payment Information</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666; width: 40%;">Subtotal:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${booking.payment.subtotal}</td>
            </tr>
            ${booking.payment.discount > 0 ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Discount${booking.payment.couponCode ? ` (${booking.payment.couponCode})` : ''}:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #16a34a;">-₹${booking.payment.discount}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Total Amount:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 18px; color: #6b21a8;">₹${booking.payment.total}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Payment Method:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-transform: uppercase;">${booking.payment.method}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">Payment Status:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <span style="background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  PENDING
                </span>
              </td>
            </tr>
          </table>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="margin: 0; color: #666;">Please check the admin dashboard for payment screenshot verification.</p>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">© 2026 Hrimkar Astro. All rights reserved.</p>
      </div>
    `
  };

  try {
    console.log('[Gmail] Attempting to send booking notification to:', ADMIN_EMAIL);
    console.log('[Gmail] EMAIL_USER configured:', !!process.env.EMAIL_USER);
    console.log('[Gmail] EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
    console.log('[Gmail] EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('[Gmail] Booking notification email sent successfully! MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Gmail] Error sending booking notification email:', error.message);
    console.error('[Gmail] Error code:', error.code);
    console.error('[Gmail] Full error:', error);
    // Don't throw error - booking should still complete even if email fails
    return null;
  }
}

module.exports = sendBookingNotification;
