import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import { getDashboardController, getArticleAnalyticsController } from '../controllers/analytics.controller.js';

const router = Router();

// All analytics routes require authentication and author role
router.use(authenticate);
router.use(requireRole(['author']));

router.get('/dashboard', getDashboardController);
router.get('/articles/:id/analytics', getArticleAnalyticsController);

export default router;