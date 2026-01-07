/**
 * Authentication Routes
 * OWASP Best Practice: Rate limiting on auth endpoints, input validation
 */
const express = require('express');
const router = express.Router();

// Import rate limiters
const { 
    authLimiter, 
    otpLimiter, 
    passwordResetLimiter 
} = require('../middleware/rateLimiter');

// Import validators
const {
    registerValidation,
    registerWithOtpValidation,
    loginValidation,
    requestOtpValidation,
    forgotPasswordValidation,
    verifyResetOtpValidation,
    resetPasswordValidation,
    updateDetailsValidation,
    updatePasswordValidation,
    paginationValidation
} = require('../middleware/inputValidator');

// Import controllers
const { requestOtp, registerWithOtp } = require('../controllers/authController');
const {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    verifyToken,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    getAllUsers,
    getUserStats
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (with rate limiting)
// ============================================

// OTP routes - strict rate limiting to prevent abuse
router.post('/request-otp', 
    otpLimiter,           // 3 requests per 10 minutes
    requestOtpValidation,  // Validate email format
    requestOtp
);

router.post('/register-with-otp', 
    authLimiter,                  // 5 attempts per 15 minutes
    registerWithOtpValidation,    // Full validation
    registerWithOtp
);

// Registration - rate limited to prevent mass account creation
router.post('/register', 
    authLimiter,          // 5 attempts per 15 minutes
    registerValidation,    // Input validation
    register
);

// Login - strict rate limiting to prevent brute force
router.post('/login', 
    authLimiter,          // 5 attempts per 15 minutes
    loginValidation,       // Validate email and password present
    login
);

// Password reset routes - rate limited
router.post('/forgot-password', 
    passwordResetLimiter,      // 3 attempts per 30 minutes
    forgotPasswordValidation,
    forgotPassword
);

router.post('/verify-reset-otp', 
    authLimiter,
    verifyResetOtpValidation,
    verifyResetOtp
);

router.post('/reset-password', 
    authLimiter,
    resetPasswordValidation,
    resetPassword
);

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/updatedetails', protect, updateDetailsValidation, updateDetails);
router.put('/updatepassword', protect, updatePasswordValidation, updatePassword);

// ============================================
// ADMIN ROUTES
// ============================================
router.get('/admin/users', 
    protect, 
    authorize('admin'), 
    paginationValidation,
    getAllUsers
);

router.get('/admin/users/stats', 
    protect, 
    authorize('admin'), 
    getUserStats
);

module.exports = router;
