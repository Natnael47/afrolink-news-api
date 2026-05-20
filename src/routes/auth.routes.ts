import { Router } from "express";
import {
  loginController,
  signupController,
} from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/rateLimiter.middleware.js";

const router = Router();

// Apply rate limiting to auth routes
router.post("/signup", authRateLimiter, signupController);
router.post("/login", authRateLimiter, loginController);

export default router;
