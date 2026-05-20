import { type NextFunction, type Request, type Response } from "express";
import { errorResponse } from "../utils/response.util.js";

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json(errorResponse("Unauthorized", ["Authentication required"]));
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json(errorResponse("Forbidden", ["Insufficient permissions"]));
    }

    next();
  };
};
