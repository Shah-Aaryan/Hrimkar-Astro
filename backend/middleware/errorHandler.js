/**
 * Error Handling Middleware
 * OWASP Best Practice: Don't expose sensitive error details in production
 */

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging (always log on server)
    // In production, consider using a proper logging service
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    // ============================================
    // MONGOOSE ERRORS
    // ============================================

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error = { 
            message: 'Resource not found', 
            statusCode: 404,
            code: 'RESOURCE_NOT_FOUND'
        };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        error = { 
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`, 
            statusCode: 400,
            code: 'DUPLICATE_FIELD'
        };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors || {}).map(val => val.message);
        error = { 
            message: messages.join(', ') || 'Validation error', 
            statusCode: 400,
            code: 'VALIDATION_ERROR'
        };
    }

    // ============================================
    // JWT ERRORS
    // ============================================

    if (err.name === 'JsonWebTokenError') {
        error = { 
            message: 'Invalid authentication token', 
            statusCode: 401,
            code: 'INVALID_TOKEN'
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = { 
            message: 'Authentication token has expired', 
            statusCode: 401,
            code: 'TOKEN_EXPIRED'
        };
    }

    // ============================================
    // RATE LIMITING ERRORS
    // ============================================

    if (err.statusCode === 429 || err.code === 'RATE_LIMIT_EXCEEDED') {
        error = {
            message: err.message || 'Too many requests, please try again later',
            statusCode: 429,
            code: 'RATE_LIMIT_EXCEEDED'
        };
    }

    // ============================================
    // FILE UPLOAD ERRORS
    // ============================================

    if (err.code === 'LIMIT_FILE_SIZE') {
        error = {
            message: 'File size too large. Maximum size is 5MB.',
            statusCode: 413,
            code: 'FILE_TOO_LARGE'
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        error = {
            message: 'Unexpected file field',
            statusCode: 400,
            code: 'UNEXPECTED_FILE'
        };
    }

    // ============================================
    // CORS ERRORS
    // ============================================

    if (err.message === 'Not allowed by CORS') {
        error = {
            message: 'Cross-origin request blocked',
            statusCode: 403,
            code: 'CORS_ERROR'
        };
    }

    // ============================================
    // BUILD RESPONSE
    // ============================================

    const statusCode = error.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    // OWASP: Don't expose internal error details in production
    const response = {
        success: false,
        message: statusCode === 500 && isProduction 
            ? 'An unexpected error occurred' 
            : error.message || 'Server Error',
        error: {
            code: error.code || 'SERVER_ERROR'
        }
    };

    // Include stack trace only in development
    if (!isProduction && err.stack) {
        response.error.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
