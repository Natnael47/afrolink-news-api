import { describe, expect, it } from "@jest/globals";
import { createArticleSchema } from "../../src/schemas/article.schema.js";
import { signupSchema } from "../../src/schemas/user.schema.js";

describe("Validation Schemas", () => {
  describe("Signup Schema", () => {
    it("should validate correct signup data", () => {
      const validData = {
        name: "John Doe",
        email: "john@example.com",
        password: "Test@123456",
        role: "author",
      };

      const result = signupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid name with numbers", () => {
      const invalidData = {
        name: "John123",
        email: "john@example.com",
        password: "Test@123456",
        role: "author",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "not-an-email",
        password: "Test@123456",
        role: "author",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const invalidData = {
        name: "John Doe",
        email: "john@example.com",
        password: "weak",
        role: "author",
      };

      const result = signupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("Article Schema", () => {
    it("should validate correct article data", () => {
      const validData = {
        title: "My Article",
        content:
          "This is a long enough content for the article to be valid because it has more than fifty characters.",
        category: "Tech",
        status: "published",
      };

      const result = createArticleSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject short title", () => {
      const invalidData = {
        title: "",
        content:
          "This is a long enough content for the article to be valid because it has more than fifty characters.",
        category: "Tech",
      };

      const result = createArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short content", () => {
      const invalidData = {
        title: "My Article",
        content: "Too short",
        category: "Tech",
      };

      const result = createArticleSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
