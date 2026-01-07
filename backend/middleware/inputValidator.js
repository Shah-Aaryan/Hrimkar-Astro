/**
 * Input Validation & Sanitization Middleware
 * OWASP Best Practice: Validate all inputs, reject unexpected data
 * 
 * Features:
 * - Schema-based validation for all endpoints
 * - Type checking and length limits
 * - Input sanitization (XSS prevention)
 * - Reject unexpected fields
 * - Consistent error responses
 */

const { body, param, query, validationResult } = require('express-validator');

// ============================================
// SANITIZATION HELPERS
// ============================================

/**
 * Sanitize string input to prevent XSS
 * Removes HTML tags, trims whitespace, normalizes unicode
 */
const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;
    
    return value
        .trim()
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove potentially dangerous characters
        .replace(/[<>'"`;(){}[\]]/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Remove null bytes
        .replace(/\0/g, '');
};

/**
 * Sanitize email - lowercase and trim
 */
const sanitizeEmail = (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().trim();
};

/**
 * Sanitize phone - keep only digits, +, and spaces
 */
const sanitizePhone = (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^\d+\s-]/g, '').trim();
};

// ============================================
// VALIDATION ERROR HANDLER
// ============================================

/**
 * Middleware to check validation results and return errors
 * OWASP: Provide clear but not overly detailed error messages
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Format errors consistently
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value ? '[REDACTED]' : undefined // Don't expose sensitive values
        }));
        
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
        });
    }
    
    next();
};

// ============================================
// FIELD WHITELIST MIDDLEWARE
// ============================================

/**
 * Creates middleware that rejects requests with unexpected fields
 * OWASP: Reject unexpected input fields
 * 
 * @param {string[]} allowedFields - Array of allowed field names
 * @param {string} location - 'body', 'query', or 'params'
 */
const allowOnlyFields = (allowedFields, location = 'body') => {
    return (req, res, next) => {
        const data = req[location] || {};
        const receivedFields = Object.keys(data);
        const unexpectedFields = receivedFields.filter(field => !allowedFields.includes(field));
        
        if (unexpectedFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Request contains unexpected fields',
                error: {
                    code: 'UNEXPECTED_FIELDS',
                    fields: unexpectedFields
                }
            });
        }
        
        next();
    };
};

// ============================================
// COMMON VALIDATION RULES
// ============================================

// Email validation with sanitization
const emailValidation = body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .isLength({ max: 254 }).withMessage('Email is too long')
    .normalizeEmail()
    .customSanitizer(sanitizeEmail);

// Password validation (OWASP recommendations)
const passwordValidation = body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number');

// Simple password (for backward compatibility - 6 char minimum)
const simplePasswordValidation = body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters');

// Name validation
const nameValidation = (field) => body(field)
    .trim()
    .notEmpty().withMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`)
    .isLength({ min: 1, max: 50 }).withMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} must be 1-50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/).withMessage(`${field.replace(/([A-Z])/g, ' $1').trim()} can only contain letters, spaces, hyphens, and apostrophes`)
    .customSanitizer(sanitizeString);

// Phone validation
const phoneValidation = body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters')
    .matches(/^\+?[\d\s-]{10,15}$/).withMessage('Please provide a valid phone number')
    .customSanitizer(sanitizePhone);

// OTP validation
const otpValidation = body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers');

// MongoDB ObjectId validation
const objectIdValidation = (field, location = 'param') => {
    const validator = location === 'param' ? param(field) : body(field);
    return validator
        .trim()
        .notEmpty().withMessage(`${field} is required`)
        .isMongoId().withMessage(`Invalid ${field} format`);
};

// Date validation
const dateValidation = (field) => body(field)
    .trim()
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format. Use ISO8601 format (YYYY-MM-DD)')
    .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (date < now) {
            throw new Error('Date cannot be in the past');
        }
        // Limit to 1 year in future
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);
        if (date > maxDate) {
            throw new Error('Date cannot be more than 1 year in the future');
        }
        return true;
    });

// Time validation (HH:MM format)
const timeValidation = body('scheduledTime')
    .trim()
    .notEmpty().withMessage('Time is required')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format. Use HH:MM format');

// ============================================
// ENDPOINT-SPECIFIC VALIDATION SCHEMAS
// ============================================

// Auth: Register validation
const registerValidation = [
    allowOnlyFields(['firstName', 'lastName', 'email', 'phone', 'password', 'otp']),
    nameValidation('firstName'),
    nameValidation('lastName'),
    emailValidation,
    phoneValidation,
    simplePasswordValidation,
    handleValidationErrors
];

// Auth: Register with OTP validation
const registerWithOtpValidation = [
    allowOnlyFields(['firstName', 'lastName', 'email', 'phone', 'password', 'otp']),
    nameValidation('firstName'),
    nameValidation('lastName'),
    emailValidation,
    phoneValidation,
    simplePasswordValidation,
    otpValidation,
    handleValidationErrors
];

// Auth: Login validation
const loginValidation = [
    allowOnlyFields(['email', 'password']),
    emailValidation,
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Auth: Request OTP validation
const requestOtpValidation = [
    allowOnlyFields(['email']),
    emailValidation,
    handleValidationErrors
];

// Auth: Forgot password validation
const forgotPasswordValidation = [
    allowOnlyFields(['email']),
    emailValidation,
    handleValidationErrors
];

// Auth: Verify reset OTP validation
const verifyResetOtpValidation = [
    allowOnlyFields(['email', 'otp']),
    emailValidation,
    otpValidation,
    handleValidationErrors
];

// Auth: Reset password validation
const resetPasswordValidation = [
    allowOnlyFields(['email', 'otp', 'newPassword']),
    emailValidation,
    otpValidation,
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
    handleValidationErrors
];

// Auth: Update details validation
const updateDetailsValidation = [
    allowOnlyFields(['firstName', 'lastName', 'phone', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth']),
    nameValidation('firstName').optional(),
    nameValidation('lastName').optional(),
    body('phone')
        .optional()
        .trim()
        .isLength({ min: 10, max: 15 }).withMessage('Phone number must be 10-15 characters')
        .matches(/^\+?[\d\s-]{10,15}$/).withMessage('Please provide a valid phone number')
        .customSanitizer(sanitizePhone),
    body('dateOfBirth')
        .optional()
        .trim()
        .isISO8601().withMessage('Invalid date format'),
    body('timeOfBirth')
        .optional()
        .trim()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('placeOfBirth')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Place of birth is too long')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// Auth: Update password validation
const updatePasswordValidation = [
    allowOnlyFields(['currentPassword', 'newPassword']),
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .notEmpty().withMessage('New password is required')
        .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters'),
    handleValidationErrors
];

// Booking: Create booking validation
const VALID_SERVICES = ['birth-chart', 'marriage-matching', 'career-guidance', 'health-astrology', 'tarot-reading', 'numerology', 'love-compatibility'];
const VALID_MODES = ['phone', 'video', 'chat'];
const VALID_PAYMENT_METHODS = ['upi', 'gpay'];

const createBookingValidation = [
    allowOnlyFields(['serviceId', 'consultationMode', 'scheduledDate', 'scheduledTime', 'timezone', 'personalDetails', 'couponCode', 'paymentMethod']),
    body('serviceId')
        .trim()
        .notEmpty().withMessage('Service is required')
        .isIn(VALID_SERVICES).withMessage('Invalid service selected'),
    body('consultationMode')
        .trim()
        .notEmpty().withMessage('Consultation mode is required')
        .isIn(VALID_MODES).withMessage('Invalid consultation mode'),
    body('scheduledDate')
        .trim()
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('scheduledTime')
        .trim()
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('timezone')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Timezone is too long'),
    body('personalDetails.fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
        .customSanitizer(sanitizeString),
    body('personalDetails.email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Valid email is required')
        .normalizeEmail(),
    body('personalDetails.phone')
        .trim()
        .notEmpty().withMessage('Phone is required')
        .isLength({ min: 10, max: 15 }).withMessage('Invalid phone number')
        .customSanitizer(sanitizePhone),
    body('personalDetails.dateOfBirth')
        .optional({ nullable: true })
        .trim()
        .custom((value) => {
            if (!value || value === 'null' || value === '') return true;
            return /^\d{4}-\d{2}-\d{2}/.test(value);
        }).withMessage('Invalid date of birth format'),
    body('personalDetails.timeOfBirth')
        .optional({ nullable: true })
        .trim()
        .custom((value) => {
            if (!value || value === 'null' || value === '') return true;
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        }).withMessage('Invalid time format'),
    body('personalDetails.placeOfBirth')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 }).withMessage('Place of birth is too long')
        .customSanitizer(sanitizeString),
    body('personalDetails.specificQuestions')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 2000 }).withMessage('Questions cannot exceed 2000 characters')
        .customSanitizer(sanitizeString),
    body('personalDetails.consultationPurpose')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Purpose cannot exceed 500 characters')
        .customSanitizer(sanitizeString),
    body('couponCode')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 20 }).withMessage('Invalid coupon code'),
    body('paymentMethod')
        .trim()
        .notEmpty().withMessage('Payment method is required')
        .isIn(VALID_PAYMENT_METHODS).withMessage('Invalid payment method'),
    handleValidationErrors
];

// Booking: Reschedule validation
const rescheduleValidation = [
    allowOnlyFields(['scheduledDate', 'scheduledTime']),
    body('scheduledDate')
        .trim()
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('scheduledTime')
        .trim()
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    handleValidationErrors
];

// Booking: Feedback validation
const feedbackValidation = [
    allowOnlyFields(['rating', 'comment']),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// Booking: Coupon validation
const couponValidation = [
    allowOnlyFields(['couponCode', 'serviceId']),
    body('couponCode')
        .trim()
        .notEmpty().withMessage('Coupon code is required')
        .isLength({ max: 20 }).withMessage('Invalid coupon code')
        .isAlphanumeric().withMessage('Coupon code must be alphanumeric'),
    body('serviceId')
        .optional()
        .trim()
        .isIn(VALID_SERVICES).withMessage('Invalid service'),
    handleValidationErrors
];

// Review: Create/Update review validation
const VALID_CATEGORIES = ['vedic', 'marriage', 'career', 'tarot', 'general'];

const reviewValidation = [
    allowOnlyFields(['rating', 'content', 'category']),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('content')
        .trim()
        .notEmpty().withMessage('Review content is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Review must be 10-1000 characters')
        .customSanitizer(sanitizeString),
    body('category')
        .optional()
        .trim()
        .isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    handleValidationErrors
];

// Admin: Block slot validation
const blockSlotValidation = [
    allowOnlyFields(['date', 'time', 'reason']),
    body('date')
        .trim()
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('time')
        .trim()
        .notEmpty().withMessage('Time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// Query parameter validation for pagination
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 }).withMessage('Invalid page number'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Search query too long')
        .customSanitizer(sanitizeString),
    handleValidationErrors
];

// ObjectId param validation
const idParamValidation = [
    objectIdValidation('id', 'param'),
    handleValidationErrors
];

const userIdParamValidation = [
    objectIdValidation('userId', 'param'),
    handleValidationErrors
];

// Date param validation (for slots)
const dateParamValidation = [
    param('date')
        .trim()
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    handleValidationErrors
];

module.exports = {
    // Helpers
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
    handleValidationErrors,
    allowOnlyFields,
    
    // Auth validations
    registerValidation,
    registerWithOtpValidation,
    loginValidation,
    requestOtpValidation,
    forgotPasswordValidation,
    verifyResetOtpValidation,
    resetPasswordValidation,
    updateDetailsValidation,
    updatePasswordValidation,
    
    // Booking validations
    createBookingValidation,
    rescheduleValidation,
    feedbackValidation,
    couponValidation,
    
    // Review validations
    reviewValidation,
    
    // Admin validations
    blockSlotValidation,
    
    // Common validations
    paginationValidation,
    idParamValidation,
    userIdParamValidation,
    dateParamValidation,
    
    // Re-export express-validator for route-specific validation
    body,
    param,
    query,
    validationResult
};
