import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { ApiResponse } from "../../src/utils/response.util.js";

// Define proper mock types
interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "author" | "reader";
  createdAt: Date;
}

interface MockSignupSuccess {
  error: false;
  user: MockUser;
}

interface MockSignupError {
  error: true;
  status: number;
  response: ApiResponse;
}

interface MockLoginSuccess {
  error: false;
  token: string;
  user: MockUser;
}

interface MockLoginError {
  error: true;
  message: string;
}

// Mock the services
jest.mock("../../../src/services/auth.service.js", () => ({
  signup: jest.fn(),
  login: jest.fn(),
}));

jest.mock("../../../src/utils/response.util.js", () => ({
  successResponse: jest.fn((msg, data) => ({
    Success: true,
    Message: msg,
    Object: data,
    Errors: null,
  })),
  errorResponse: jest.fn((msg, errors) => ({
    Success: false,
    Message: msg,
    Object: null,
    Errors: errors || [],
  })),
}));

jest.mock("../../../src/utils/validation.util.js", () => ({
  formatZodErrors: jest.fn(() => ["Validation error"]),
}));

import {
  loginController,
  signupController,
} from "../../src/controllers/auth.controller.js";
import { login, signup } from "../../src/services/auth.service.js";

const mockSignup = signup as jest.MockedFunction<typeof signup>;
const mockLogin = login as jest.MockedFunction<typeof login>;

describe("Auth Controller", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("signupController", () => {
    it("should return 201 on successful signup", async () => {
      const mockResponse: MockSignupSuccess = {
        error: false,
        user: {
          id: "1",
          name: "Test",
          email: "test@test.com",
          role: "author",
          createdAt: new Date(),
        },
      };

      mockSignup.mockResolvedValue(mockResponse as never);

      req.body = {
        name: "Test User",
        email: "test@test.com",
        password: "Test@123456",
        role: "author",
      };

      await signupController(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 409 on duplicate email", async () => {
      const mockResponse: MockSignupError = {
        error: true,
        status: 409,
        response: {
          Success: false,
          Message: "Email already exists",
          Object: null,
          Errors: ["Duplicate email"],
        },
      };

      mockSignup.mockResolvedValue(mockResponse as never);

      req.body = {
        name: "Test User",
        email: "existing@test.com",
        password: "Test@123456",
        role: "author",
      };

      await signupController(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe("loginController", () => {
    it("should return 200 on successful login", async () => {
      const mockResponse: MockLoginSuccess = {
        error: false,
        token: "fake-token",
        user: {
          id: "1",
          name: "Test",
          email: "test@test.com",
          role: "author",
          createdAt: new Date(),
        },
      };

      mockLogin.mockResolvedValue(mockResponse as never);

      req.body = {
        email: "test@test.com",
        password: "Test@123456",
      };

      await loginController(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    it("should return 401 on invalid credentials", async () => {
      const mockResponse: MockLoginError = {
        error: true,
        message: "Invalid credentials",
      };

      mockLogin.mockResolvedValue(mockResponse as never);

      req.body = {
        email: "wrong@test.com",
        password: "wrong",
      };

      await loginController(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
