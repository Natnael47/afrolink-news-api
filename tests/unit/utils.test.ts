import { describe, expect, it } from "@jest/globals";
import {
  errorResponse,
  paginatedResponse,
  successResponse,
} from "../../src/utils/response.util.js";

describe("Response Utilities", () => {
  describe("successResponse", () => {
    it("should create success response with data", () => {
      const result = successResponse("Success message", { id: 1 });

      expect(result.Success).toBe(true);
      expect(result.Message).toBe("Success message");
      expect(result.Object).toEqual({ id: 1 });
      expect(result.Errors).toBeNull();
    });

    it("should create success response without data", () => {
      const result = successResponse("Success message");

      expect(result.Success).toBe(true);
      expect(result.Object).toBeNull();
    });
  });

  describe("errorResponse", () => {
    it("should create error response with errors", () => {
      const result = errorResponse("Error message", ["Error 1", "Error 2"]);

      expect(result.Success).toBe(false);
      expect(result.Message).toBe("Error message");
      expect(result.Errors).toEqual(["Error 1", "Error 2"]);
      expect(result.Object).toBeNull();
    });

    it("should create error response without errors", () => {
      const result = errorResponse("Error message");

      expect(result.Success).toBe(false);
      expect(result.Errors).toEqual([]);
    });
  });

  describe("paginatedResponse", () => {
    it("should create paginated response", () => {
      const data = [{ id: 1 }, { id: 2 }];
      const result = paginatedResponse(data, 1, 10, 25, "Success");

      expect(result.Success).toBe(true);
      expect(result.Object).toEqual(data);
      expect(result.PageNumber).toBe(1);
      expect(result.PageSize).toBe(10);
      expect(result.TotalSize).toBe(25);
    });
  });
});
