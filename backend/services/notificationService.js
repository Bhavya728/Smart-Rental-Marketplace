const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    // Create a mock transporter for development
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'demo@smartrental.com',
        pass: process.env.EMAIL_PASS || 'demo_password'
      }
    });
  }

  // Send booking approval notification
  async sendBookingApproval(booking, renter, owner) {
    try {
      const emailData = {
        to: renter.email,
        subject: `Booking Request Approved - ${booking.listing_id.title}`,
        template: 'booking_approval',
        data: {
          renterName: `${renter.first_name} ${renter.last_name}`,
          ownerName: `${owner.first_name} ${owner.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          checkOut: booking.end_date.toLocaleDateString(),
          totalCost: booking.total_cost,
          referenceNumber: booking.reference_number,
          guestCount: booking.guest_count
        }
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Approval Email Sent:', emailData);
        return { success: true, message: 'Mock approval email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send booking approval notification:', error);
      throw new Error(`Failed to send booking approval notification: ${error.message}`);
    }
  }

  // Send booking rejection notification
  async sendBookingRejection(booking, renter, owner, reason = null) {
    try {
      const emailData = {
        to: renter.email,
        subject: `Booking Request Update - ${booking.listing_id.title}`,
        template: 'booking_rejection',
        data: {
          renterName: `${renter.first_name} ${renter.last_name}`,
          ownerName: `${owner.first_name} ${owner.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          checkOut: booking.end_date.toLocaleDateString(),
          referenceNumber: booking.reference_number,
          rejectionReason: reason || 'No specific reason provided'
        }
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Rejection Email Sent:', emailData);
        return { success: true, message: 'Mock rejection email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send booking rejection notification:', error);
      throw new Error(`Failed to send booking rejection notification: ${error.message}`);
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking, renter, owner) {
    try {
      const emailData = {
        to: renter.email,
        subject: `Booking Confirmation - ${booking.listing_id.title}`,
        template: 'booking_confirmation',
        data: {
          renterName: `${renter.first_name} ${renter.last_name}`,
          ownerName: `${owner.first_name} ${owner.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          checkOut: booking.end_date.toLocaleDateString(),
          totalCost: booking.total_cost,
          referenceNumber: booking.reference_number,
          guestCount: booking.guest_count
        }
      };

      // In development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Email Sent:', emailData);
        return { success: true, message: 'Mock email sent successfully' };
      }

      // In production, send actual email
      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      throw new Error(`Failed to send booking confirmation: ${error.message}`);
    }
  }

  // Send booking cancellation notification
  async sendBookingCancellation(booking, cancelledBy, recipient) {
    try {
      const emailData = {
        to: recipient.email,
        subject: `Booking Cancelled - ${booking.listing_id.title}`,
        template: 'booking_cancellation',
        data: {
          recipientName: `${recipient.first_name} ${recipient.last_name}`,
          cancelledByName: `${cancelledBy.first_name} ${cancelledBy.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          checkOut: booking.end_date.toLocaleDateString(),
          referenceNumber: booking.reference_number,
          cancellationReason: booking.cancellation_reason || 'No reason provided',
          refundAmount: booking.calculateRefundAmount()
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Email Sent:', emailData);
        return { success: true, message: 'Mock email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send cancellation notification:', error);
      throw new Error(`Failed to send cancellation notification: ${error.message}`);
    }
  }

  // Send payment confirmation
  async sendPaymentConfirmation(transaction, payer, recipient) {
    try {
      const emailData = {
        to: payer.email,
        subject: `Payment Confirmation - ${transaction.reference_number}`,
        template: 'payment_confirmation',
        data: {
          payerName: `${payer.first_name} ${payer.last_name}`,
          recipientName: `${recipient.first_name} ${recipient.last_name}`,
          amount: transaction.amount,
          transactionId: transaction.reference_number,
          paymentMethod: transaction.payment_method,
          cardLastFour: transaction.mock_payment_details.card_last_four
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Email Sent:', emailData);
        return { success: true, message: 'Mock email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      throw new Error(`Failed to send payment confirmation: ${error.message}`);
    }
  }

  // Send booking reminder (24 hours before check-in)
  async sendBookingReminder(booking, renter) {
    try {
      const emailData = {
        to: renter.email,
        subject: `Check-in Reminder - Tomorrow at ${booking.listing_id.title}`,
        template: 'booking_reminder',
        data: {
          renterName: `${renter.first_name} ${renter.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          address: booking.listing_id.address,
          referenceNumber: booking.reference_number
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Email Sent:', emailData);
        return { success: true, message: 'Mock email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send booking reminder:', error);
      throw new Error(`Failed to send booking reminder: ${error.message}`);
    }
  }

  // Send new booking notification to owner
  async sendNewBookingNotification(booking, owner, renter) {
    try {
      const emailData = {
        to: owner.email,
        subject: `New Booking Request Awaiting Approval - ${booking.listing_id.title}`,
        template: 'new_booking_notification',
        data: {
          ownerName: `${owner.first_name} ${owner.last_name}`,
          renterName: `${renter.first_name} ${renter.last_name}`,
          listingTitle: booking.listing_id.title,
          checkIn: booking.start_date.toLocaleDateString(),
          checkOut: booking.end_date.toLocaleDateString(),
          totalCost: booking.total_cost,
          referenceNumber: booking.reference_number,
          guestCount: booking.guest_count,
          specialRequests: booking.special_requests
        }
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Mock Email Sent:', emailData);
        return { success: true, message: 'Mock email sent successfully' };
      }

      const result = await this.sendEmail(emailData);
      return result;
    } catch (error) {
      console.error('Failed to send new booking notification:', error);
      throw new Error(`Failed to send new booking notification: ${error.message}`);
    }
  }

  // Generic email sending method
  async sendEmail({ to, subject, template, data }) {
    try {
      const htmlContent = this.generateEmailTemplate(template, data);
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@smartrental.com',
        to,
        subject,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Generate email template (simple HTML templates)
  generateEmailTemplate(template, data) {
    const templates = {
      booking_confirmation: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Booking Confirmed! 🎉</h1>
            
            <p>Hi ${data.renterName},</p>
            <p>Great news! Your booking has been confirmed.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Booking Details</h3>
              <p><strong>Property:</strong> ${data.listingTitle}</p>
              <p><strong>Check-in:</strong> ${data.checkIn}</p>
              <p><strong>Check-out:</strong> ${data.checkOut}</p>
              <p><strong>Guests:</strong> ${data.guestCount}</p>
              <p><strong>Total Cost:</strong> $${data.totalCost}</p>
              <p><strong>Booking Reference:</strong> ${data.referenceNumber}</p>
            </div>
            
            <p>Your host ${data.ownerName} is looking forward to welcoming you!</p>
            <p>If you have any questions, feel free to reach out through our messaging system.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>Thank you for choosing Smart Rental Marketplace!</p>
            </div>
          </div>
        </div>
      `,
      
      booking_cancellation: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; margin-bottom: 20px;">Booking Cancelled</h1>
            
            <p>Hi ${data.recipientName},</p>
            <p>We're sorry to inform you that your booking has been cancelled by ${data.cancelledByName}.</p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Cancelled Booking Details</h3>
              <p><strong>Property:</strong> ${data.listingTitle}</p>
              <p><strong>Check-in:</strong> ${data.checkIn}</p>
              <p><strong>Check-out:</strong> ${data.checkOut}</p>
              <p><strong>Booking Reference:</strong> ${data.referenceNumber}</p>
              <p><strong>Reason:</strong> ${data.cancellationReason}</p>
              ${data.refundAmount > 0 ? `<p><strong>Refund Amount:</strong> $${data.refundAmount}</p>` : ''}
            </div>
            
            ${data.refundAmount > 0 ? '<p>Your refund will be processed within 3-5 business days.</p>' : ''}
            <p>We apologize for any inconvenience this may cause.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>Smart Rental Marketplace Support Team</p>
            </div>
          </div>
        </div>
      `,
      
      payment_confirmation: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #059669; margin-bottom: 20px;">Payment Confirmed! ✅</h1>
            
            <p>Hi ${data.payerName},</p>
            <p>Your payment has been successfully processed.</p>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Payment Details</h3>
              <p><strong>Amount:</strong> $${data.amount}</p>
              <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod} ending in ${data.cardLastFour}</p>
              <p><strong>Recipient:</strong> ${data.recipientName}</p>
            </div>
            
            <p>A receipt has been sent to your email address.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>Thank you for using Smart Rental Marketplace!</p>
            </div>
          </div>
        </div>
      `,

      new_booking_notification: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #7c3aed; margin-bottom: 20px;">New Booking Request! 📋</h1>
            
            <p>Hi ${data.ownerName},</p>
            <p>You have a new booking request for your property.</p>
            
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Booking Request Details</h3>
              <p><strong>Property:</strong> ${data.listingTitle}</p>
              <p><strong>Guest:</strong> ${data.renterName}</p>
              <p><strong>Check-in:</strong> ${data.checkIn}</p>
              <p><strong>Check-out:</strong> ${data.checkOut}</p>
              <p><strong>Guests:</strong> ${data.guestCount}</p>
              <p><strong>Total Value:</strong> $${data.totalCost}</p>
              <p><strong>Reference:</strong> ${data.referenceNumber}</p>
              ${data.specialRequests ? `<p><strong>Special Requests:</strong> ${data.specialRequests}</p>` : ''}
            </div>
            
            <p>Please review and respond to this booking request as soon as possible.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>Smart Rental Marketplace</p>
            </div>
          </div>
        </div>
      `
    };

    return templates[template] || `<p>Email template not found for: ${template}</p>`;
  }

  // Send bulk notifications (for system-wide announcements)
  async sendBulkNotification(userEmails, subject, message) {
    try {
      const emailPromises = userEmails.map(email => 
        this.sendEmail({
          to: email,
          subject,
          template: 'system_notification',
          data: { message }
        })
      );

      await Promise.all(emailPromises);
      return { success: true, sent: userEmails.length };
    } catch (error) {
      throw new Error(`Failed to send bulk notifications: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();