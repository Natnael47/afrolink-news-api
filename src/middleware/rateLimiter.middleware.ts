import rateLimit from "express-rate-limit";

// Strict rate limiter for auth routes (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    Success: false,
    Message: "Too many authentication attempts",
    Object: null,
    Errors: ["Please try again after 15 minutes"],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for article reads - prevents 100 reads in 10 seconds
export const readRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 100, // 100 requests per 10 seconds (as per requirement)
  message: {
    Success: false,
    Message: "Too many read requests",
    Object: null,
    Errors: ["Rate limit exceeded. Maximum 100 article reads per 10 seconds."],
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id || req.ip || "anonymous";
  },
});

// Stricter limiter for non-authenticated users reading articles
export const publicReadRateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 20, // 20 requests for non-authenticated users
  message: {
    Success: false,
    Message: "Too many read requests",
    Object: null,
    Errors: [
      "Please slow down. Maximum 20 article reads per 10 seconds for non-authenticated users.",
    ],
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "anonymous",
});

// General API rate limiter (optional)
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  message: {
    Success: false,
    Message: "Too many requests",
    Object: null,
    Errors: ["Please slow down your requests"],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health check endpoint
    return req.path === "/health";
  },
});
