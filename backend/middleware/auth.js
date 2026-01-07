/**
 * Authentication Middleware
 * OWASP Best Practice: Secure token handling, proper authorization
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - verify JWT
 * OWASP: Validate tokens properly, check user exists and is active
 */
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Extract token from "Bearer <token>"
        token = req.headers.authorization.split(' ')[1];
    }
    // Fallback: Check for token in cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // OWASP: Reject if no token provided
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.',
            error: { code: 'NO_TOKEN' }
        });
    }

    // Validate token format (basic check before verification)
    if (typeof token !== 'string' || token.length < 10) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token format',
            error: { code: 'INVALID_TOKEN_FORMAT' }
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // OWASP: Validate token payload structure
        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload',
                error: { code: 'INVALID_TOKEN_PAYLOAD' }
            });
        }

        // Get user from token (exclude password)
        const user = await User.findById(decoded.id).select('-password');

        // OWASP: Check user still exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists',
                error: { code: 'USER_NOT_FOUND' }
            });
        }

        // OWASP: Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact support.',
                error: { code: 'ACCOUNT_BANNED' }
            });
        }

        // OWASP: Check if password was changed after token issued
        // (If you have passwordChangedAt field in User model)
        if (user.passwordChangedAt && decoded.iat) {
            const changedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
            if (decoded.iat < changedTimestamp) {
                return res.status(401).json({
                    success: false,
                    message: 'Password was recently changed. Please log in again.',
                    error: { code: 'PASSWORD_CHANGED' }
                });
            }
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authentication token',
                error: { code: 'INVALID_TOKEN' }
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired. Please log in again.',
                error: { code: 'TOKEN_EXPIRED' }
            });
        }

        // Generic auth error
        console.error('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: { code: 'AUTH_FAILED' }
        });
    }
};

/**
 * Grant access to specific roles
 * OWASP: Proper role-based access control
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Check if user exists (should be set by protect middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: { code: 'NO_USER' }
            });
        }

        // Check if user has required role
        if (!roles.includes(req.user.role)) {
            // OWASP: Don't reveal which roles are valid
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
                error: { code: 'INSUFFICIENT_PERMISSIONS' }
            });
        }

        next();
    };
};

/**
 * Optional auth - attach user if token exists but don't block
 * Useful for routes that behave differently for logged-in users
 */
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (token && typeof token === 'string' && token.length >= 10) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.id) {
                const user = await User.findById(decoded.id).select('-password');
                if (user && !user.isBanned) {
                    req.user = user;
                }
            }
        } catch (error) {
            // Token invalid but continue without user
            req.user = null;
        }
    }

    next();
};
