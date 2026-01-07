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

// Time validation (supports both 24-hour HH:MM and 12-hour H:MM AM/PM formats)
const timeValidation = body('scheduledTime')
    .trim()
    .notEmpty().withMessage('Time is required')
    .matches(/^((0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)|([01]?[0-9]|2[0-3]):[0-5][0-9])$/).withMessage('Invalid time format. Use H:MM AM/PM or HH:MM format');

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

// Map human-friendly display names to valid service ids
const SERVICE_NAME_MAP = {
    'vedic astrology': 'birth-chart',
    'birth chart': 'birth-chart',
    'marriage matching': 'marriage-matching',
    'career guidance': 'career-guidance',
    'health astrology': 'health-astrology',
    'tarot card reading': 'tarot-reading',
    'tarot reading': 'tarot-reading',
    'numerology': 'numerology',
    'love & compatibility guidance': 'love-compatibility',
    'love compatibility': 'love-compatibility',
    'love & compatibility': 'love-compatibility'
};

const createBookingValidation = [
    // First validate top-level fields
    (req, res, next) => {
        console.log('Validating booking request body:', JSON.stringify(req.body, null, 2));
        
        const topLevelFields = ['serviceId', 'service', 'consultationMode', 'scheduledDate', 'scheduledTime', 'timezone', 'personalDetails', 'couponCode', 'paymentMethod'];
        const receivedFields = Object.keys(req.body || {});
        const unexpectedFields = receivedFields.filter(field => !topLevelFields.includes(field));
        
        if (unexpectedFields.length > 0) {
            console.log('Unexpected top-level fields:', unexpectedFields);
            return res.status(400).json({
                success: false,
                message: 'Request contains unexpected fields',
                error: {
                    code: 'UNEXPECTED_FIELDS',
                    fields: unexpectedFields
                }
            });
        }
        
        // Validate personalDetails nested fields
        if (req.body.personalDetails && typeof req.body.personalDetails === 'object') {
            const allowedPersonalFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'timeOfBirth', 'placeOfBirth', 'specificQuestions', 'consultationPurpose'];
            const receivedPersonalFields = Object.keys(req.body.personalDetails);
            const unexpectedPersonalFields = receivedPersonalFields.filter(field => !allowedPersonalFields.includes(field));
            
            if (unexpectedPersonalFields.length > 0) {
                console.log('Unexpected personalDetails fields:', unexpectedPersonalFields);
                return res.status(400).json({
                    success: false,
                    message: 'personalDetails contains unexpected fields',
                    error: {
                        code: 'UNEXPECTED_FIELDS',
                        fields: unexpectedPersonalFields
                    }
                });
            }
        }
        
        next();
    },
    // Support legacy/front-end sending human-friendly "service" instead of "serviceId". Map names -> ids here before further validation.
    (req, res, next) => {
        // Helper function to normalize and map service to valid serviceId
        const normalizeServiceId = (svc) => {
            if (!svc) return null;

            // Accept object form { id: 'birth-chart', name: 'Vedic Astrology' }
            if (typeof svc === 'object' && svc.id) {
                const normalized = String(svc.id).trim().toLowerCase();
                if (VALID_SERVICES.includes(normalized)) {
                    return normalized;
                }
            }

            if (typeof svc === 'string') {
                const normalized = svc.trim().toLowerCase();

                // Direct id match
                if (VALID_SERVICES.includes(normalized)) {
                    return normalized;
                }

                // Map common human-friendly names to ids
                const SERVICE_NAME_MAP = {
                    'vedic astrology': 'birth-chart',
                    'birth chart': 'birth-chart',
                    'marriage matching': 'marriage-matching',
                    'marriage astrology': 'marriage-matching',
                    'career guidance': 'career-guidance',
                    'career astrology': 'career-guidance',
                    'health astrology': 'health-astrology',
                    'medical/health astrology': 'health-astrology',
                    'tarot card reading': 'tarot-reading',
                    'tarot reading': 'tarot-reading',
                    'numerology': 'numerology',
                    'love & compatibility guidance': 'love-compatibility',
                    'love compatibility': 'love-compatibility',
                    'love & compatibility': 'love-compatibility'
                };

                if (SERVICE_NAME_MAP[normalized]) {
                    return SERVICE_NAME_MAP[normalized];
                }

                // Loose match: remove non-alphanum and compare
                const normalizeKey = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const target = normalizeKey(normalized);
                for (const id of VALID_SERVICES) {
                    if (normalizeKey(id) === target) {
                        return id;
                    }
                }
            }

            return null;
        };

        // If serviceId is already present, check if it's valid
        if (req.body.serviceId) {
            const normalized = String(req.body.serviceId).trim().toLowerCase();
            // If it's already a valid serviceId, nothing to do
            if (VALID_SERVICES.includes(normalized)) {
                req.body.serviceId = normalized; // Ensure it's normalized
                return next();
            }
            // If serviceId is present but invalid, try to normalize it (might be a service name)
            const mapped = normalizeServiceId(req.body.serviceId);
            if (mapped) {
                req.body.serviceId = mapped;
                return next();
            }
            // If we can't map it, continue to validation which will return an error
            return next();
        }

        // If serviceId is not present, try to get it from service or serviceName
        const svc = req.body.service || req.body.serviceName || null;
        if (!svc) return next();

        const mapped = normalizeServiceId(svc);
        if (mapped) {
            req.body.serviceId = mapped;
            return next();
        }

        // If we couldn't map it, continue — validation will return a helpful error
        next();
    },
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
        .custom((value) => {
            // Accept both 12-hour (AM/PM) and 24-hour formats
            const time12Hour = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
            const time24Hour = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
            if (time12Hour.test(value) || time24Hour.test(value)) {
                return true;
            }
            throw new Error('Invalid time format. Use H:MM AM/PM (e.g., "2:00 PM") or HH:MM 24-hour format (e.g., "14:00")');
        }),
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
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value || value === 'null' || value === '' || value === null) return true;
            if (typeof value !== 'string') return false;
            return /^\d{4}-\d{2}-\d{2}/.test(value.trim());
        }).withMessage('Invalid date of birth format'),
    body('personalDetails.timeOfBirth')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value || value === 'null' || value === '' || value === null) return true;
            if (typeof value !== 'string') return false;
            return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value.trim());
        }).withMessage('Invalid time format'),
    body('personalDetails.placeOfBirth')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(value => value && typeof value === 'string' ? value.trim() : value)
        .custom((value) => {
            if (!value || value === null) return true;
            return value.length <= 100;
        }).withMessage('Place of birth is too long')
        .customSanitizer(sanitizeString),
    body('personalDetails.specificQuestions')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(value => value && typeof value === 'string' ? value.trim() : value)
        .custom((value) => {
            if (!value || value === null) return true;
            return value.length <= 2000;
        }).withMessage('Questions cannot exceed 2000 characters')
        .customSanitizer(sanitizeString),
    body('personalDetails.consultationPurpose')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(value => value && typeof value === 'string' ? value.trim() : value)
        .custom((value) => {
            if (!value || value === null) return true;
            return value.length <= 500;
        }).withMessage('Purpose cannot exceed 500 characters')
        .customSanitizer(sanitizeString),
    body('couponCode')
        .optional({ nullable: true, checkFalsy: true })
        .customSanitizer(value => value && typeof value === 'string' ? value.trim() : value)
        .custom((value) => {
            if (!value || value === null) return true;
            return value.length <= 20;
        }).withMessage('Invalid coupon code'),
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
        .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/).withMessage('Invalid time format. Use H:MM AM/PM format'),
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
    allowOnlyFields(['couponCode', 'serviceId', 'service']),
    // Support optional 'service' alias — map to serviceId before validation
    (req, res, next) => {
        if (req.body.serviceId) return next();
        const svc = req.body.service;
        if (!svc) return next();

        if (typeof svc === 'string') {
            const normalized = svc.trim().toLowerCase();
            if (VALID_SERVICES.includes(normalized)) {
                req.body.serviceId = normalized;
                return next();
            }
            if (SERVICE_NAME_MAP[normalized]) {
                req.body.serviceId = SERVICE_NAME_MAP[normalized];
                return next();
            }
            const normalizeKey = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
            const target = normalizeKey(normalized);
            for (const id of VALID_SERVICES) {
                if (normalizeKey(id) === target) {
                    req.body.serviceId = id;
                    return next();
                }
            }
        } else if (typeof svc === 'object' && svc.id) {
            req.body.serviceId = String(svc.id).trim();
            return next();
        }

        next();
    },
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
    allowOnlyFields(['date', 'timeSlot', 'reason', 'isFullDay']),
    // Convert isFullDay to boolean if it's a string
    (req, res, next) => {
        if (req.body.isFullDay !== undefined) {
            // Handle string "true"/"false" or boolean
            if (typeof req.body.isFullDay === 'string') {
                req.body.isFullDay = req.body.isFullDay.toLowerCase() === 'true';
            } else {
                req.body.isFullDay = Boolean(req.body.isFullDay);
            }
        }
        next();
    },
    body('date')
        .trim()
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Invalid date format'),
    body('timeSlot')
        .custom((value, { req }) => {
            // Only validate timeSlot if isFullDay is not true
            if (req.body.isFullDay === true) {
                return true; // Skip validation if full day is blocked
            }
            // Time slot is required when not blocking full day
            if (!value || typeof value !== 'string' || value.trim() === '') {
                throw new Error('Time slot is required when not blocking full day');
            }
            // Validate time format (12-hour with AM/PM)
            const timeFormat = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM|am|pm)$/;
            if (!timeFormat.test(value.trim())) {
                throw new Error('Invalid time format. Use H:MM AM/PM format (e.g., "2:00 PM")');
            }
            return true;
        }),
    body('isFullDay')
        .optional()
        .isBoolean().withMessage('isFullDay must be a boolean'),
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
