import { type Request, type Response } from "express";
import {
  getArticleAnalytics,
  getAuthorDashboard,
} from "../services/analytics.service.js";
import { errorResponse, successResponse } from "../utils/response.util.js";

export const getDashboardController = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.id;
    const dashboard = await getAuthorDashboard(authorId);

    res.json(successResponse("Dashboard retrieved successfully", dashboard));
  } catch (error) {
    console.error("Dashboard error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", [
          "Failed to retrieve dashboard",
        ]),
      );
  }
};

export const getArticleAnalyticsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // FIX: Check if id exists
    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Article ID is required", ["Missing article ID"]));
    }

    // FIX: Ensure articleId is a string
    const articleId = Array.isArray(id) ? id[0] : id;

    // FIX: Check if articleId is valid
    if (!articleId) {
      return res
        .status(400)
        .json(
          errorResponse("Invalid article ID", ["Article ID cannot be empty"]),
        );
    }

    const authorId = req.user!.id;

    const result = await getArticleAnalytics(articleId, authorId);

    if (result.error) {
      return res
        .status(404)
        .json(errorResponse("Article not found", ["Article not found"]));
    }

    res.json(
      successResponse(
        "Article analytics retrieved successfully",
        result.analytics,
      ),
    );
  } catch (error) {
    console.error("Article analytics error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", [
          "Failed to retrieve analytics",
        ]),
      );
  }
};
