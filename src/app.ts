import cors from "cors";
import dotenv from "dotenv";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import morgan from "morgan";
import articleRoutes from "./routes/article.routes.js";
import authRoutes from "./routes/auth.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // Logging

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use('/api/author', analyticsRoutes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    Success: true,
    Message: "Server is running",
    Object: { timestamp: new Date().toISOString() },
    Errors: null,
  });
});

// Root endpoint
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

// TODO: Import routes here (will add after creating them)
// import authRoutes from './routes/auth.routes.js';
// import articleRoutes from './routes/article.routes.js';
// import readerRoutes from './routes/reader.routes.js';
// import analyticsRoutes from './routes/analytics.routes.js';

// TODO: Use routes here
// app.use('/api/auth', authRoutes);
// app.use('/api/articles', articleRoutes);
// app.use('/api/reader', readerRoutes);
// app.use('/api/author', analyticsRoutes);

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    Success: false,
    Message: "Route not found",
    Object: null,
    Errors: [`Cannot ${req.method} ${req.url}`],
  });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    Success: false,
    Message: err.message || "Internal server error",
    Object: null,
    Errors: [err.message || "Something went wrong on the server"],
  });
});

// Start server only if this file is run directly (not imported in tests)
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

export default app;
