import { afterAll, beforeAll, describe, expect, it, jest } from "@jest/globals";

// Mock the auth middleware
jest.mock("../../../src/middleware/auth.middleware.js", () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { id: "author-id", role: "author" };
    next();
  },
}));

// Mock the article service
jest.mock("../../../src/services/article.service.js", () => ({
  createArticle: jest.fn(),
  getMyArticles: jest.fn(),
  updateArticle: jest.fn(),
  deleteArticle: jest.fn(),
  getAllPublicArticles: jest.fn(),
  getArticleById: jest.fn(),
}));

import request from "supertest";
import app from "../../src/app.js";
import {
  createArticle,
  getAllPublicArticles,
} from "../../src/services/article.service.js";

const mockCreateArticle = createArticle as jest.MockedFunction<typeof createArticle>;
const mockGetAllPublicArticles = getAllPublicArticles as jest.MockedFunction<typeof getAllPublicArticles>;

describe("Article Endpoints", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/articles", () => {
    it("should create an article successfully", async () => {
      const mockArticle = {
        id: "article-123",
        title: "Test Article",
        content: "This is a test article with enough content to be valid...",
        category: "Tech",
        status: "published" as const,
        authorId: "author-id",
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        author: {
          id: "author-id",
          name: "Test Author",
          email: "author@test.com",
        },
      };

      mockCreateArticle.mockResolvedValue({
        error: false,
        article: mockArticle,
      } as any);

      const response = await request(app)
        .post("/api/articles")
        .set("Authorization", "Bearer fake-token")
        .send({
          title: "Test Article",
          content: "This is a test article with enough content to be valid because it has more than fifty characters.",
          category: "Tech",
          status: "published",
        });

      expect(response.status).toBe(201);
      expect(response.body.Success).toBe(true);
    });

    it("should return 401 without token", async () => {
      const response = await request(app)
        .post("/api/articles")
        .send({
          title: "Test Article",
          content: "This is a test article with enough content to be valid because it has more than fifty characters.",
          category: "Tech",
          status: "published",
        });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/articles", () => {
    it("should return paginated articles", async () => {
      mockGetAllPublicArticles.mockResolvedValue({
        articles: [{ id: "1", title: "Test" }],
        total: 1,
      } as any);

      const response = await request(app)
        .get("/api/articles?page=1&pageSize=10");

      expect(response.status).toBe(200);
      expect(response.body.Success).toBe(true);
      expect(response.body).toHaveProperty("PageNumber");
      expect(response.body).toHaveProperty("PageSize");
    });
  });
});