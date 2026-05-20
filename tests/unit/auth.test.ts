import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";

// Mock auth middleware
jest.mock("../../../src/middleware/auth.middleware.js", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: "author-id", role: "author" };
    next();
  },
}));

// Mock analytics service
jest.mock("../../../src/services/analytics.service.js", () => ({
  getAuthorDashboard: jest.fn(),
  getArticleAnalytics: jest.fn(),
}));

import request from "supertest";
import app from "../../src/app.js";
import { getAuthorDashboard } from "../../src/services/analytics.service.js";

const mockGetAuthorDashboard = getAuthorDashboard as jest.MockedFunction<
  typeof getAuthorDashboard
>;

describe("Analytics Endpoints", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("GET /api/author/dashboard", () => {
    it("should return author dashboard", async () => {
      const mockDashboard = {
        totalArticles: 5,
        publishedArticles: 3,
        draftArticles: 2,
        totalReads: 150,
        averageReadsPerArticle: 30,
        topArticle: {
          id: "article-1",
          title: "Top Article",
          reads: 100,
        },
        recentDailyStats: [],
      };

      mockGetAuthorDashboard.mockResolvedValue(mockDashboard as any);

      const response = await request(app)
        .get("/api/author/dashboard")
        .set("Authorization", "Bearer fake-token");

      expect(response.status).toBe(200);
      expect(response.body.Success).toBe(true);
      expect(response.body.Object).toHaveProperty("totalArticles");
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/author/dashboard");

      expect(response.status).toBe(401);
    });
  });
});
