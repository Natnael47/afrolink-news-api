import { type Request, type Response } from "express";
import { ZodError } from "zod";
import { loginSchema, signupSchema } from "../schemas/user.schema.js";
import { login, signup } from "../services/auth.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";
import { formatZodErrors } from "../utils/validation.util.js";

export const signupController = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const result = await signup(validatedData);

    if (result.error) {
      return res.status(result.status || 400).json(result.response);
    }

    return res
      .status(201)
      .json(successResponse("User created successfully", result.user));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      return res.status(400).json(errorResponse("Validation failed", errors));
    }

    console.error("Signup error:", error);

    return res
      .status(500)
      .json(errorResponse("Internal server error", ["Failed to create user"]));
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const { email, password } = validatedData as {
      email: string;
      password: string;
    };

    const result = await login(email, password);

    if (result.error) {
      return res
        .status(401)
        .json(
          errorResponse("Invalid email or password", [
            "Invalid email or password",
          ]),
        );
    }

    return res.json(
      successResponse("Login successful", {
        token: result.token,
        user: result.user,
      }),
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      return res.status(400).json(errorResponse("Validation failed", errors));
    }

    console.error("Login error:", error);

    return res
      .status(500)
      .json(errorResponse("Internal server error", ["Failed to login"]));
  }
};
