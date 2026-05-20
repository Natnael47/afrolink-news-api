import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';
import {
  createArticleController,
  getMyArticlesController,
  updateArticleController,
  deleteArticleController,
  getAllPublicArticlesController,
  getArticleByIdController
} from '../controllers/article.controller.js';

const router = Router();

// Public routes
router.get('/', getAllPublicArticlesController);
router.get('/public/:id', getArticleByIdController);

// Author-only routes
router.post('/', authenticate, requireRole(['author']), createArticleController);
router.get('/me', authenticate, requireRole(['author']), getMyArticlesController);
router.put('/:id', authenticate, requireRole(['author']), updateArticleController);
router.delete('/:id', authenticate, requireRole(['author']), deleteArticleController);

export default router;