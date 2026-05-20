import { beforeAll, describe, expect, it } from "@jest/globals";
import request from "supertest";
import app from "../../src/app.js";

let authToken: string;
let articleId: string;

describe("Analytics Endpoints", () => {
  beforeAll(async () => {
    // Create test author
    await request(app).post("/api/auth/signup").send({
      name: "Analytics Author",
      email: "analytics@example.com",
      password: "Test@123456",
      role: "author",
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email: "analytics@example.com",
      password: "Test@123456",
    });

    authToken = loginRes.body.Object.token;

    // Create test article
    const articleRes = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Analytics Test Article",
        content:
          "This is a test article for analytics with enough content to pass validation. It has more than fifty characters for sure.",
        category: "Analytics",
        status: "published",
      });

    articleId = articleRes.body.Object.id;

    // Simulate some reads
    await request(app).get(`/api/articles/public/${articleId}`);
    await request(app).get(`/api/articles/public/${articleId}`);
  });

  describe("GET /api/author/dashboard", () => {
    it("should get author dashboard", async () => {
      const response = await request(app)
        .get("/api/author/dashboard")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.Success).toBe(true);
      expect(response.body.Object).toHaveProperty("totalArticles");
      expect(response.body.Object).toHaveProperty("totalReads");
      expect(response.body.Object.totalArticles).toBeGreaterThan(0);
    });

    it("should reject without authentication", async () => {
      const response = await request(app).get("/api/author/dashboard");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/author/articles/:id/analytics", () => {
    it("should get article analytics", async () => {
      const response = await request(app)
        .get(`/api/author/articles/${articleId}/analytics`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.Success).toBe(true);
      expect(response.body.Object).toHaveProperty("articleId");
      expect(response.body.Object).toHaveProperty("totalReads");
    });
  });
});
