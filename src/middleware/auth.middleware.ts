import { type NextFunction, type Request, type Response } from "express";
import { verifyToken } from "../utils/jwt.util.js";
import { errorResponse } from "../utils/response.util.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json(errorResponse("No token provided", ["Authentication required"]));
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json(errorResponse("Invalid token format", ["Authentication failed"]));
  }

  try {
    const decoded = verifyToken(token) as { sub: string; role: string };
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (error) {
    return res
      .status(401)
      .json(errorResponse("Invalid token", ["Authentication failed"]));
  }
};
