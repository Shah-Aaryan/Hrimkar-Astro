/**
 * Security Headers & Configuration Middleware
 * OWASP Best Practice: Defense in depth with security headers
 * 
 * Features:
 * - Content Security Policy (CSP)
 * - XSS Protection headers
 * - Clickjacking protection
 * - MIME type sniffing prevention
 * - HSTS for production
 * - Request size limits
 * - Security logging
 */

/**
 * Security headers middleware
 * Sets various HTTP security headers following OWASP recommendations
 */
const securityHeaders = (req, res, next) => {
    // Remove server identification header
    res.removeHeader('X-Powered-By');
    
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy (restrict browser features)
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Content Security Policy (CSP) - adjust as needed for your frontend
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Content-Security-Policy', 
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
            "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
            "img-src 'self' data: https: blob:; " +
            "connect-src 'self' https://api.cloudinary.com; " +
            "frame-ancestors 'none';"
        );
        
        // HTTP Strict Transport Security (HSTS) - only in production with HTTPS
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Cache control for API responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    next();
};

/**
 * Request size limiter
 * Prevents large payload attacks
 */
const requestSizeLimiter = (maxSize = '10kb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0', 10);
        const maxBytes = parseSize(maxSize);
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                message: 'Request payload too large',
                error: {
                    code: 'PAYLOAD_TOO_LARGE',
                    maxSize: maxSize
                }
            });
        }
        
        next();
    };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size) => {
    if (typeof size === 'number') return size;
    
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };
    
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) return 10240; // Default 10kb
    
    const num = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return Math.floor(num * units[unit]);
};

/**
 * Security logging middleware
 * Logs security-relevant events
 */
const securityLogger = (req, res, next) => {
    // Log potentially suspicious requests
    const suspicious = [];
    
    // Check for SQL injection patterns
    const sqlPatterns = /(\b(union|select|insert|update|delete|drop|exec|execute|xp_)\b)/i;
    const requestStr = JSON.stringify(req.body) + JSON.stringify(req.query) + req.url;
    
    if (sqlPatterns.test(requestStr)) {
        suspicious.push('SQL_INJECTION_ATTEMPT');
    }
    
    // Check for XSS patterns
    const xssPatterns = /<script|javascript:|on\w+\s*=/i;
    if (xssPatterns.test(requestStr)) {
        suspicious.push('XSS_ATTEMPT');
    }
    
    // Check for path traversal
    if (req.url.includes('..') || req.url.includes('%2e%2e')) {
        suspicious.push('PATH_TRAVERSAL_ATTEMPT');
    }
    
    // Log if suspicious
    if (suspicious.length > 0) {
        console.warn(`[SECURITY WARNING] ${new Date().toISOString()} | IP: ${getClientIP(req)} | Path: ${req.path} | Flags: ${suspicious.join(', ')}`);
    }
    
    next();
};

/**
 * Get client IP (helper)
 */
const getClientIP = (req) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * Validate content type
 * Ensures requests have appropriate content type
 */
const validateContentType = (allowedTypes = ['application/json']) => {
    return (req, res, next) => {
        // Skip for GET, HEAD, OPTIONS requests
        if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
            return next();
        }
        
        // Skip if no body
        if (!req.body || Object.keys(req.body).length === 0) {
            return next();
        }
        
        const contentType = req.headers['content-type'] || '';
        const isValid = allowedTypes.some(type => contentType.includes(type));
        
        if (!isValid) {
            return res.status(415).json({
                success: false,
                message: 'Unsupported media type',
                error: {
                    code: 'UNSUPPORTED_MEDIA_TYPE',
                    expected: allowedTypes
                }
            });
        }
        
        next();
    };
};

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 * Removes $ operators from user input
 */
const sanitizeMongoQuery = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        for (const key in obj) {
            // Remove keys starting with $ (MongoDB operators)
            if (key.startsWith('$')) {
                delete obj[key];
                continue;
            }
            
            // Recursively sanitize nested objects
            if (typeof obj[key] === 'object') {
                obj[key] = sanitize(obj[key]);
            }
        }
        
        return obj;
    };
    
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    
    next();
};

module.exports = {
    securityHeaders,
    requestSizeLimiter,
    securityLogger,
    validateContentType,
    sanitizeMongoQuery
};
