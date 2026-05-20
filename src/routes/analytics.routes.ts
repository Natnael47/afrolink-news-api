import { Router } from "express";
import {
  getArticleAnalyticsController,
  getDashboardController,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { apiRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Apply general rate limiting to analytics routes
router.use(apiRateLimiter);
router.use(authenticate);
router.use(requireRole(["author"]));

router.get("/dashboard", getDashboardController);
router.get("/articles/:id/analytics", getArticleAnalyticsController);

export default router;
