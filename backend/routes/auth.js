const { requestOtp, registerWithOtp } = require('../controllers/authController');
router.post('/request-otp', [body('email').isEmail().withMessage('Valid email required')], requestOtp);
router.post('/register-with-otp', [...registerValidation, body('otp').notEmpty().withMessage('OTP required')], registerWithOtp);
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    verifyToken
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.get('/verify', protect, verifyToken);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
