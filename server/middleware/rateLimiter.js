const rateLimit = require('express-rate-limit');

// Global rate limiter
const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict auth rate limiter (login/register)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

// Application submission rate limiter
const applicationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'You have applied to too many jobs in the last hour. Please try again later.',
  },
});

// Job posting rate limiter
const jobPostRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'You have posted too many jobs today. Please try again tomorrow.',
  },
});

// Scraping rate limiter
const scrapingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many scraping requests. Please wait before triggering again.',
  },
});

module.exports = {
  globalRateLimiter,
  authRateLimiter,
  applicationRateLimiter,
  jobPostRateLimiter,
  scrapingRateLimiter,
};
