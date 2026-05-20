import { Router } from "express";
import {
  getArticleAnalyticsController,
  getDashboardController,
} from "../controllers/analytics.controller.js";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { apiRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { analyticsQueue } from "../services/jobQueue.service.js";

const router = Router();

// Apply general rate limiting to analytics routes
router.use(apiRateLimiter);
router.use(authenticate);
router.use(requireRole(["author"]));

router.get("/dashboard", getDashboardController);
router.get("/articles/:id/analytics", getArticleAnalyticsController);

router.get("/debug/read-logs", async (req, res) => {
  try {
    const readLogs = await prisma.readLog.findMany({
      orderBy: { readAt: "desc" },
      take: 20,
      include: {
        article: {
          select: {
            title: true,
            id: true,
          },
        },
      },
    });

    res.json({
      Success: true,
      Message: "Read logs retrieved",
      Object: {
        totalReads: readLogs.length,
        readLogs: readLogs,
      },
      Errors: null,
    });
  } catch (error) {
    res.status(500).json({
      Success: false,
      Message: "Failed to retrieve read logs",
      Object: null,
      Errors: [String(error)],
    });
  }
});

// Optional: Manual trigger for testing (remove in production)
router.post("/trigger-analytics", async (req, res) => {
  const date = req.body.date || new Date().toISOString().split("T")[0];
  const job = await analyticsQueue.add({ date });
  res.json({
    Success: true,
    Message: `Analytics job added for ${date}`,
    Object: { jobId: job.id, status: "queued" },
    Errors: null,
  });
});

export default router;
