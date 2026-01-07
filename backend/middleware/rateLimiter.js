/**
 * Rate Limiting Middleware
 * OWASP Best Practice: Protect against brute force and DoS attacks
 * 
 * Features:
 * - IP-based rate limiting for all requests
 * - Stricter limits for auth endpoints (login, register, OTP)
 * - User-based rate limiting for authenticated routes
 * - Graceful 429 responses with retry-after headers
 * - In-memory store (consider Redis for production clusters)
 */

// In-memory stores for rate limiting
// NOTE: For production with multiple instances, use Redis or similar
const ipRequestStore = new Map();
const userRequestStore = new Map();
const authAttemptStore = new Map();

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
    const now = Date.now();
    
    // Clean IP store
    for (const [key, data] of ipRequestStore.entries()) {
        if (now - data.windowStart > 60000) { // 1 minute window
            ipRequestStore.delete(key);
        }
    }
    
    // Clean user store
    for (const [key, data] of userRequestStore.entries()) {
        if (now - data.windowStart > 60000) {
            userRequestStore.delete(key);
        }
    }
    
    // Clean auth store (longer window for security)
    for (const [key, data] of authAttemptStore.entries()) {
        if (now - data.windowStart > 900000) { // 15 minute window
            authAttemptStore.delete(key);
        }
    }
}, 300000); // Run every 5 minutes

/**
 * Get client IP address, handling proxies
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
const getClientIP = (req) => {
    // Trust X-Forwarded-For only if behind trusted proxy
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // Take the first IP (original client)
        return forwardedFor.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Generic rate limiter factory
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 60000,        // Time window in milliseconds (default: 1 minute)
        maxRequests = 100,       // Max requests per window (default: 100)
        message = 'Too many requests, please try again later.',
        keyGenerator = getClientIP,  // Function to generate unique key
        store = ipRequestStore,      // Which store to use
        skipSuccessfulRequests = false,
        skipFailedRequests = false
    } = options;

    return (req, res, next) => {
        const key = typeof keyGenerator === 'function' ? keyGenerator(req) : keyGenerator;
        const now = Date.now();
        
        // Get or create entry
        let entry = store.get(key);
        
        if (!entry || now - entry.windowStart > windowMs) {
            // New window
            entry = {
                windowStart: now,
                count: 0,
                blocked: false
            };
        }
        
        entry.count++;
        
        // Check if over limit
        if (entry.count > maxRequests) {
            entry.blocked = true;
            store.set(key, entry);
            
            // Calculate retry-after in seconds
            const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);
            
            // Set standard rate limit headers
            res.set({
                'Retry-After': retryAfter,
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': 0,
                'X-RateLimit-Reset': new Date(entry.windowStart + windowMs).toISOString()
            });
            
            // OWASP: Return consistent error format
            return res.status(429).json({
                success: false,
                message,
                retryAfter,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    details: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds exceeded`
                }
            });
        }
        
        // Set rate limit headers for successful requests
        res.set({
            'X-RateLimit-Limit': maxRequests,
            'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count),
            'X-RateLimit-Reset': new Date(entry.windowStart + windowMs).toISOString()
        });
        
        store.set(key, entry);
        next();
    };
};

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
const generalLimiter = createRateLimiter({
    windowMs: 60000,      // 1 minute
    maxRequests: 100,     // 100 requests per minute
    message: 'Too many requests from this IP, please try again after a minute.',
    store: ipRequestStore
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP (prevents brute force)
 */
const authLimiter = createRateLimiter({
    windowMs: 900000,     // 15 minutes
    maxRequests: 5,       // 5 attempts
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    store: authAttemptStore
});

/**
 * OTP rate limiter
 * 3 OTP requests per 10 minutes per email/IP combo
 */
const otpLimiter = createRateLimiter({
    windowMs: 600000,     // 10 minutes
    maxRequests: 3,       // 3 OTP requests
    message: 'Too many OTP requests. Please wait 10 minutes before requesting another OTP.',
    keyGenerator: (req) => `${getClientIP(req)}-${req.body?.email || 'unknown'}`,
    store: new Map()      // Separate store for OTP
});

/**
 * Password reset rate limiter
 * 3 attempts per 30 minutes per IP
 */
const passwordResetLimiter = createRateLimiter({
    windowMs: 1800000,    // 30 minutes
    maxRequests: 3,       // 3 attempts
    message: 'Too many password reset attempts. Please try again in 30 minutes.',
    store: new Map()      // Separate store
});

/**
 * Booking creation rate limiter
 * 10 bookings per hour per user
 */
const bookingLimiter = createRateLimiter({
    windowMs: 3600000,    // 1 hour
    maxRequests: 10,      // 10 bookings
    message: 'Too many booking requests. Please try again later.',
    keyGenerator: (req) => req.user?.id || getClientIP(req),
    store: userRequestStore
});

/**
 * Review submission rate limiter
 * 5 review actions per hour per user
 */
const reviewLimiter = createRateLimiter({
    windowMs: 3600000,    // 1 hour
    maxRequests: 5,       // 5 reviews
    message: 'Too many review submissions. Please try again later.',
    keyGenerator: (req) => req.user?.id || getClientIP(req),
    store: new Map()
});

/**
 * File upload rate limiter
 * 10 uploads per hour per user
 */
const uploadLimiter = createRateLimiter({
    windowMs: 3600000,    // 1 hour
    maxRequests: 10,      // 10 uploads
    message: 'Too many file uploads. Please try again later.',
    keyGenerator: (req) => req.user?.id || getClientIP(req),
    store: new Map()
});

/**
 * Admin API rate limiter
 * Higher limit for admin operations
 * 200 requests per minute
 */
const adminLimiter = createRateLimiter({
    windowMs: 60000,      // 1 minute
    maxRequests: 200,     // 200 requests
    message: 'Admin rate limit exceeded. Please slow down.',
    keyGenerator: (req) => req.user?.id || getClientIP(req),
    store: new Map()
});

module.exports = {
    generalLimiter,
    authLimiter,
    otpLimiter,
    passwordResetLimiter,
    bookingLimiter,
    reviewLimiter,
    uploadLimiter,
    adminLimiter,
    createRateLimiter,
    getClientIP
};
