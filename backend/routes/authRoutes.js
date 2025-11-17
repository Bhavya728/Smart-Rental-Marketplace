const express = require('express');
const authController = require('../controllers/authController');
const verificationController = require('../controllers/verificationController');
const { protect, isLoggedIn, verifyRefreshToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateOTP,
  validateToken,
  validateProfileUpdate,
  validatePasswordChange,
} = require('../middleware/validation');
const {
  authLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  registrationLimiter,
  loginLimiter,
} = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register', 
  registrationLimiter,
  validateUserRegistration,
  authController.register
);

router.post('/login', 
  loginLimiter,
  validateUserLogin,
  authController.login
);

router.post('/forgot-password', 
  passwordResetLimiter,
  validateEmail,
  authController.forgotPassword
);

router.post('/reset-password', 
  passwordResetLimiter,
  validateToken,
  validatePassword,
  authController.resetPassword
);

router.post('/verify-email', 
  emailVerificationLimiter,
  validateToken,
  authController.verifyEmail
);

router.post('/refresh-token', 
  authLimiter,
  verifyRefreshToken,
  authController.refreshToken
);

router.get('/check', 
  isLoggedIn,
  authController.checkAuth
);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.post('/logout', authController.logout);

router.get('/me', authController.getMe);

router.put('/me', 
  validateProfileUpdate,
  authController.updateProfile
);

router.post('/send-verification', 
  emailVerificationLimiter,
  authController.sendEmailVerification
);

router.post('/send-otp', 
  emailVerificationLimiter,
  authController.sendEmailOTP
);

router.post('/verify-otp', 
  validateOTP,
  authController.verifyEmailOTP
);

router.put('/change-password', 
  authLimiter,
  validatePasswordChange,
  authController.changePassword
);

router.delete('/delete-account', 
  authLimiter,
  validatePassword,
  authController.deleteAccount
);

// New verification endpoints (improved OTP method)
router.post('/send-verification-code',
  emailVerificationLimiter,
  verificationController.sendEmailVerificationCode
);

router.post('/verify-email-code',
  emailVerificationLimiter,
  verificationController.verifyEmailWithCode
);

router.get('/verification-status',
  verificationController.checkVerificationStatus
);

module.exports = router;