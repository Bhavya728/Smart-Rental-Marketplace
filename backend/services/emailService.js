const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');
const { generateVerificationCode } = require('../utils/codeGenerator');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  // Initialize email transporter
  init() {
    try {
      // Check if using Gmail SMTP or other services
      const isGmailSMTP = process.env.EMAIL_HOST === 'smtp.gmail.com';
      
      if (isGmailSMTP) {
        // Gmail SMTP configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === 'true' || false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false
          }
        });
      } else {
        // Mailtrap or other email service configuration
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
          port: parseInt(process.env.EMAIL_PORT) || 2525,
          secure: process.env.EMAIL_SECURE === 'true' || false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      }

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  // Verify email transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }

  // Generate OTP
  generateOTP(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Welcome to Smart Rental Marketplace!',
        html: this.getWelcomeEmailTemplate(user),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw new AppError('Failed to send welcome email', 500);
    }
  }

  // Send email verification code (improved method)
  async sendVerificationCode(email, firstName) {
    try {
      // Generate a 6-digit verification code
      const code = generateVerificationCode();
      
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: email,
        subject: 'Verify Your Email Address',
        html: this.getVerificationCodeTemplate(firstName, code)
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Verification code email sent to ${email}: ${info.messageId}`);
      
      return { success: true, code };
    } catch (error) {
      logger.error('Failed to send verification code email:', error);
      throw new AppError('Failed to send verification code email', 500);
    }
  }

  // Send email verification (legacy method - for backward compatibility)
  async sendEmailVerification(user, verificationToken) {
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${user.email}`;
      
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Verify Your Email Address',
        html: this.getEmailVerificationTemplate(user, verificationUrl),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email verification sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email verification:', error);
      throw new AppError('Failed to send email verification', 500);
    }
  }

  // Send OTP for email verification
  async sendEmailOTP(user, otp) {
    try {
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Your Email Verification Code',
        html: this.getOTPEmailTemplate(user, otp),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`OTP email sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send OTP email:', error);
      throw new AppError('Failed to send OTP email', 500);
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: this.getPasswordResetTemplate(user, resetUrl),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new AppError('Failed to send password reset email', 500);
    }
  }

  // Send password changed confirmation
  async sendPasswordChangeConfirmation(user) {
    try {
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Password Changed Successfully',
        html: this.getPasswordChangeTemplate(user),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password change confirmation sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send password change confirmation:', error);
      throw new AppError('Failed to send password change confirmation', 500);
    }
  }

  // Send account locked notification
  async sendAccountLockedEmail(user) {
    try {
      const mailOptions = {
        from: `"Smart Rental Marketplace" <${process.env.EMAIL_FROM || 'noreply@smartrental.com'}>`,
        to: user.email,
        subject: 'Account Temporarily Locked',
        html: this.getAccountLockedTemplate(user),
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Account locked notification sent to ${user.email}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send account locked notification:', error);
      throw new AppError('Failed to send account locked notification', 500);
    }
  }

  // Email templates
  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Smart Rental Marketplace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9, #d946ef); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Smart Rental Marketplace!</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>We're excited to have you join our community of renters and owners.</p>
            <p>With Smart Rental Marketplace, you can:</p>
            <ul>
              <li>🏠 List your items for rent and earn extra income</li>
              <li>🔍 Find and rent items from trusted community members</li>
              <li>💬 Connect with other users through our secure messaging</li>
              <li>⭐ Build your reputation through reviews and ratings</li>
            </ul>
            <p>To get started, please verify your email address:</p>
            <a href="${process.env.CLIENT_URL}/profile" class="button">Complete Your Profile</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy renting!</p>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // New verification code email template
  getVerificationCodeTemplate(firstName, code) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background-color: #f9f9f9; border-radius: 10px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { max-width: 150px; margin-bottom: 20px; }
          h1 { color: #4f46e5; margin-bottom: 15px; }
          .verification-code { background-color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 15px; margin: 30px 0; border-radius: 5px; border: 1px dashed #ccc; }
          .footer { margin-top: 40px; font-size: 13px; text-align: center; color: #777; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          
          <p>Hi ${firstName},</p>
          
          <p>Thank you for registering with Smart Rental Marketplace. To complete your registration, please use the verification code below:</p>
          
          <div class="verification-code">${code}</div>
          
          <p>This code will expire in 10 minutes for security reasons.</p>
          
          <p>If you did not request this verification, please ignore this email or contact our support team if you have any concerns.</p>
          
          <p>Best regards,<br>The Smart Rental Marketplace Team</p>
          
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Smart Rental Marketplace. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(user, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9, #d946ef); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ Verify Your Email Address</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>Thanks for signing up! To complete your registration and start using Smart Rental Marketplace, please verify your email address.</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This verification link will expire in 24 hours for security reasons.
            </div>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOTPEmailTemplate(user, otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9, #d946ef); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp { background: #1f2937; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; margin: 20px 0; letter-spacing: 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Your Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>Your email verification code is:</p>
            <div class="otp">${otp}</div>
            <div class="warning">
              <strong>⚠️ Important:</strong> This code will expire in 10 minutes for security reasons.
            </div>
            <p>Enter this code in the verification form to complete your email verification.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444, #f97316); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fef2f2; border: 1px solid #f87171; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>We received a request to reset your password for your Smart Rental Marketplace account.</p>
            <a href="${resetUrl}" class="button">Reset Your Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <div class="warning">
              <strong>🚨 Security Notice:</strong> This password reset link will expire in 10 minutes for security reasons.
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, if you continue to receive these emails, please contact our support team immediately.</p>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordChangeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed Successfully</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .info { background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Changed Successfully</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>Your password has been successfully changed on ${new Date().toLocaleDateString()}.</p>
            <div class="info">
              <strong>✅ Confirmation:</strong> Your account is now secured with your new password.
            </div>
            <p>If you didn't make this change, please contact our support team immediately at support@smartrental.com</p>
            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a unique password that you don't use elsewhere</li>
              <li>Enabling two-factor authentication if available</li>
              <li>Keeping your password confidential</li>
            </ul>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAccountLockedTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Temporarily Locked</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Account Temporarily Locked</h1>
          </div>
          <div class="content">
            <h2>Hi ${user.fullName || user.name?.firstName}!</h2>
            <p>We've temporarily locked your account due to multiple failed login attempts.</p>
            <div class="warning">
              <strong>🛡️ Security Measure:</strong> Your account will be automatically unlocked after 2 hours.
            </div>
            <p>This is a security measure to protect your account from unauthorized access attempts.</p>
            <p>If this wasn't you, please:</p>
            <ul>
              <li>Check if you're using the correct password</li>
              <li>Reset your password if needed</li>
              <li>Contact our support team if you suspect unauthorized access</li>
            </ul>
            <p>You can try logging in again after the lockout period expires.</p>
            <p><strong>The Smart Rental Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Smart Rental Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Create and export a singleton instance
const emailService = new EmailService();

module.exports = emailService;