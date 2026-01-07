/**
 * Secure Configuration Management
 * OWASP Best Practice: Secure handling of API keys and secrets
 * 
 * Features:
 * - Centralized environment variable validation
 * - No hard-coded secrets
 * - Configuration validation on startup
 * - Secure defaults
 * - Environment-specific settings
 */

/**
 * Required environment variables
 * Application will fail to start if these are missing
 */
const REQUIRED_ENV_VARS = [
    'MONGODB_URI',
    'JWT_SECRET'
];

/**
 * Optional environment variables with defaults
 */
const ENV_DEFAULTS = {
    NODE_ENV: 'development',
    PORT: '5000',
    JWT_EXPIRE: '7d',
    JWT_COOKIE_EXPIRE: '7',
    
    // Rate limiting defaults
    RATE_LIMIT_WINDOW_MS: '60000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    AUTH_RATE_LIMIT_MAX: '5',
    
    // Request limits
    MAX_REQUEST_SIZE: '10kb',
    MAX_FILE_SIZE: '5242880', // 5MB
    
    // CORS (comma-separated list)
    CORS_ORIGINS: 'http://localhost:5500,http://127.0.0.1:5500'
};

/**
 * Validate required environment variables
 * Call this on application startup
 * @throws {Error} If required variables are missing
 */
const validateEnvVars = () => {
    const missing = [];
    const warnings = [];
    
    // Check required variables
    for (const varName of REQUIRED_ENV_VARS) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    
    // Check for secure JWT secret
    if (process.env.JWT_SECRET) {
        if (process.env.JWT_SECRET.length < 32) {
            warnings.push('JWT_SECRET should be at least 32 characters for security');
        }
        if (process.env.JWT_SECRET === 'your-secret-key' || 
            process.env.JWT_SECRET === 'secret' ||
            process.env.JWT_SECRET === 'jwt-secret') {
            warnings.push('JWT_SECRET appears to be a default/weak value - please use a strong secret');
        }
    }
    
    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        warnings.push('EMAIL_USER and EMAIL_PASS not configured - email functionality will not work');
    }
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
        warnings.push('Cloudinary not fully configured - file uploads may not work');
    }
    
    // Print warnings
    if (warnings.length > 0) {
        console.warn('\n⚠️  Configuration Warnings:');
        warnings.forEach(w => console.warn(`   - ${w}`));
        console.warn('');
    }
    
    // Throw if required variables missing
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or environment configuration.'
        );
    }
    
    console.log('✅ Environment configuration validated');
};

/**
 * Get configuration value with fallback to default
 * @param {string} key - Environment variable name
 * @returns {string} Configuration value
 */
const getConfig = (key) => {
    return process.env[key] || ENV_DEFAULTS[key];
};

/**
 * Get integer configuration value
 * @param {string} key - Environment variable name
 * @returns {number} Configuration value as integer
 */
const getConfigInt = (key) => {
    const value = getConfig(key);
    return parseInt(value, 10);
};

/**
 * Get boolean configuration value
 * @param {string} key - Environment variable name
 * @returns {boolean} Configuration value as boolean
 */
const getConfigBool = (key) => {
    const value = getConfig(key);
    return value === 'true' || value === '1' || value === 'yes';
};

/**
 * Check if running in production
 * @returns {boolean} True if in production mode
 */
const isProduction = () => {
    return getConfig('NODE_ENV') === 'production';
};

/**
 * Check if running in development
 * @returns {boolean} True if in development mode
 */
const isDevelopment = () => {
    return getConfig('NODE_ENV') === 'development';
};

/**
 * Get CORS origins as array
 * @returns {string[]} Array of allowed origins
 */
const getCorsOrigins = () => {
    const origins = getConfig('CORS_ORIGINS');
    return origins.split(',').map(o => o.trim()).filter(o => o);
};

/**
 * Secure configuration object
 * Provides type-safe access to configuration
 */
const config = {
    // Server
    port: () => getConfigInt('PORT'),
    nodeEnv: () => getConfig('NODE_ENV'),
    isProduction,
    isDevelopment,
    
    // Database
    mongoUri: () => process.env.MONGODB_URI,
    
    // JWT
    jwtSecret: () => process.env.JWT_SECRET,
    jwtExpire: () => getConfig('JWT_EXPIRE'),
    jwtCookieExpire: () => getConfigInt('JWT_COOKIE_EXPIRE'),
    
    // Email
    emailUser: () => process.env.EMAIL_USER,
    emailPass: () => process.env.EMAIL_PASS,
    
    // Cloudinary
    cloudinaryCloudName: () => process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: () => process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: () => process.env.CLOUDINARY_API_SECRET,
    
    // Rate limiting
    rateLimitWindowMs: () => getConfigInt('RATE_LIMIT_WINDOW_MS'),
    rateLimitMaxRequests: () => getConfigInt('RATE_LIMIT_MAX_REQUESTS'),
    authRateLimitMax: () => getConfigInt('AUTH_RATE_LIMIT_MAX'),
    
    // Request limits
    maxRequestSize: () => getConfig('MAX_REQUEST_SIZE'),
    maxFileSize: () => getConfigInt('MAX_FILE_SIZE'),
    
    // CORS
    corsOrigins: getCorsOrigins
};

module.exports = {
    validateEnvVars,
    getConfig,
    getConfigInt,
    getConfigBool,
    config,
    isProduction,
    isDevelopment,
    REQUIRED_ENV_VARS,
    ENV_DEFAULTS
};
