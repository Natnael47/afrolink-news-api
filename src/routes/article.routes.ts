import { Router } from "express";
import {
  createArticleController,
  deleteArticleController,
  getAllPublicArticlesController,
  getArticleByIdController,
  getMyArticlesController,
  updateArticleController,
} from "../controllers/article.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  apiRateLimiter,
  publicReadRateLimiter,
} from "../middleware/rateLimiter.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";

const router = Router();

// Public routes with read rate limiting
router.get("/", apiRateLimiter, getAllPublicArticlesController);
router.get("/public/:id", publicReadRateLimiter, getArticleByIdController);

router.post(
  "/",
  authenticate,
  requireRole(["author"]),
  apiRateLimiter,
  createArticleController,
);
router.get(
  "/me",
  authenticate,
  requireRole(["author"]),
  apiRateLimiter,
  getMyArticlesController,
);
router.put(
  "/:id",
  authenticate,
  requireRole(["author"]),
  apiRateLimiter,
  updateArticleController,
);
router.delete(
  "/:id",
  authenticate,
  requireRole(["author"]),
  apiRateLimiter,
  deleteArticleController,
);

export default router;
