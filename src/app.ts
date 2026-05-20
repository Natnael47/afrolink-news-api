import cors from "cors";
import dotenv from "dotenv";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import {
  apiRateLimiter,
  authRateLimiter,
} from "./middleware/rateLimiter.middleware.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import {
  getQueueStatus,
  processYesterdayAnalytics,
  scheduleDailyAnalytics,
} from "./services/jobQueue.service.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRateLimiter);
app.use("/api/articles", apiRateLimiter);
app.use("/api/author", apiRateLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/author", analyticsRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    Success: true,
    Message: "Server is running",
    Object: { timestamp: new Date().toISOString() },
    Errors: null,
  });
});

app.get("/queue/status", async (req: Request, res: Response) => {
  try {
    const status = await getQueueStatus();
    res.json({
      Success: true,
      Message: "Queue status retrieved",
      Object: status,
      Errors: null,
    });
  } catch (error) {
    res.status(500).json({
      Success: false,
      Message: "Failed to get queue status",
      Object: null,
      Errors: [String(error)],
    });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    Success: true,
    Message: "Welcome to Afrolink News API",
    Object: {
      version: "1.0.0",
      endpoints: "/api/auth, /api/articles, /api/author",
    },
    Errors: null,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    Success: false,
    Message: "Route not found",
    Object: null,
    Errors: [`Cannot ${req.method} ${req.url}`],
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    Success: false,
    Message: err.message || "Internal server error",
    Object: null,
    Errors: [err.message || "Something went wrong on the server"],
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Health check: http://localhost:${PORT}/health`);

    if (process.env.REDIS_URL) {
      try {
        console.log("🔄 Initializing analytics job queue...");
        await processYesterdayAnalytics();
        scheduleDailyAnalytics();
        console.log("✅ Analytics job queue started successfully");

        setTimeout(async () => {
          const status = await getQueueStatus();
          console.log("📊 Queue status:", status);
        }, 2000);
      } catch (error) {
        console.warn(
          "⚠️ Redis connection failed. Analytics job queue disabled.",
        );
        console.warn("   Make sure Redis is running on", process.env.REDIS_URL);
      }
    } else {
      console.log("ℹ️ REDIS_URL not set. Analytics job queue disabled.");
    }
  });
}

export default app;
