/**
 * Rate Limiting Middleware
 * Prevents API abuse and ensures fair usage
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: {
        status: 'error',
        message: 'Too many requests. Please try again later.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false // Disable all validation warnings
});

// Stricter limiter for code execution
const executionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 executions per minute
    message: {
        status: 'error',
        message: 'Execution rate limit exceeded. Maximum 10 executions per minute.',
        retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    validate: false, // Disable all validation warnings
    skip: (req) => req.path === '/health'
});

module.exports = {
    apiLimiter,
    executionLimiter
};
