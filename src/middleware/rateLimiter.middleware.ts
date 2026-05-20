import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    Success: false,
    Message: "Too many authentication attempts",
    Object: null,
    Errors: ["Please try again after 15 minutes"],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

export const readRateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 100,
  message: {
    Success: false,
    Message: "Too many read requests",
    Object: null,
    Errors: ["Rate limit exceeded. Maximum 100 article reads per 10 seconds."],
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicReadRateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 20,
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
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: {
    Success: false,
    Message: "Too many requests",
    Object: null,
    Errors: ["Please slow down your requests"],
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
});
