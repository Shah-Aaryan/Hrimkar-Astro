const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables from .env file in the same directory as server.js
dotenv.config({ path: path.join(__dirname, '.env') });

// Import configuration and validate environment
const { validateEnvVars, config, isProduction } = require('./config/secureConfig');

// Validate required environment variables before proceeding
// This will throw an error if required variables are missing
try {
    validateEnvVars();
} catch (error) {
    console.error('❌ Configuration Error:', error.message);
    process.exit(1);
}

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import security middleware
const { 
    securityHeaders, 
    securityLogger, 
    sanitizeMongoQuery,
    validateContentType 
} = require('./middleware/security');
const { generalLimiter } = require('./middleware/rateLimiter');

// Connect to database
connectDB();

const app = express();

// ============================================
// SECURITY MIDDLEWARE (Order matters!)
// ============================================

// 1. Security headers (first to apply to all responses)
app.use(securityHeaders);

// 2. Security logging (log suspicious requests early)
app.use(securityLogger);

// 3. General rate limiting (protect against DoS)
app.use(generalLimiter);

// 4. Body parser with size limits (OWASP: limit request sizes)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Validate content type for POST/PUT/PATCH requests
app.use(validateContentType(['application/json', 'multipart/form-data']));

// 6. Sanitize MongoDB queries (prevent NoSQL injection)
app.use(sanitizeMongoQuery);

// 7. Cookie parser
app.use(cookieParser());

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    ...config.corsOrigins()
];

// Remove duplicates
const uniqueOrigins = [...new Set(allowedOrigins.filter(o => o && o !== 'null'))];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) {
            return callback(null, true);
        }
        
        // Check if origin is allowed
        if (uniqueOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // In development, allow all origins with a warning
        if (!isProduction()) {
            console.warn(`[CORS] Allowing request from non-whitelisted origin: ${origin}`);
            return callback(null, true);
        }
        
        // In production, reject unknown origins
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight for 24 hours
}));

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));

// Health check route (no rate limit for monitoring)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Cosmic Wisdom API is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv()
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler middleware
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
const PORT = config.port();
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🌟 Cosmic Wisdom API Server                              ║
║                                                            ║
║   Server running in ${(config.nodeEnv() || 'development').padEnd(12)} mode              ║
║   Port: ${String(PORT).padEnd(5)}                                          ║
║   API URL: http://localhost:${PORT}/api                       ║
║                                                            ║
║   🔒 Security Features Enabled:                            ║
║      • Rate Limiting                                       ║
║      • Input Validation                                    ║
║      • Security Headers                                    ║
║      • NoSQL Injection Prevention                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`❌ Error: ${err.message}`);
    server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('💤 Process terminated');
        process.exit(0);
    });
});
