import { type Request, type Response } from "express";
import { ZodError } from "zod";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../schemas/article.schema.js";
import {
  createArticle,
  deleteArticle,
  getAllPublicArticles,
  getArticleById,
  getMyArticles,
  updateArticle,
} from "../services/article.service.js";
import {
  errorResponse,
  paginatedResponse,
  successResponse,
} from "../utils/response.util.js";
import { formatZodErrors } from "../utils/validation.util.js";

export const createArticleController = async (req: Request, res: Response) => {
  try {
    const validatedData = createArticleSchema.parse(req.body);
    const authorId = req.user!.id;

    const result = await createArticle(authorId, validatedData);

    if (result.error) {
      return res
        .status(400)
        .json(
          errorResponse("Failed to create article", ["Something went wrong"]),
        );
    }

    res
      .status(201)
      .json(successResponse("Article created successfully", result.article));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      return res.status(400).json(errorResponse("Validation failed", errors));
    }
    console.error("Create article error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to create article"]),
      );
  }
};

export const getMyArticlesController = async (req: Request, res: Response) => {
  try {
    const authorId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const result = await getMyArticles(authorId, page, pageSize);

    res.json(
      paginatedResponse(
        result.articles,
        page,
        pageSize,
        result.total,
        "Articles retrieved successfully",
      ),
    );
  } catch (error) {
    console.error("Get my articles error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to retrieve articles"]),
      );
  }
};

export const updateArticleController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Article ID is required", ["Missing article ID"]));
    }

    const authorId = req.user!.id;
    const validatedData = updateArticleSchema.parse(req.body);

    // Use id directly with ! to tell TypeScript it's definitely a string
    const result = await updateArticle(id!, authorId, validatedData);

    if (result.error) {
      return res.status(result.status || 400).json(result.response);
    }

    res.json(successResponse("Article updated successfully", result.article));
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = formatZodErrors(error);
      return res.status(400).json(errorResponse("Validation failed", errors));
    }
    console.error("Update article error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to update article"]),
      );
  }
};

export const deleteArticleController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Fix: Check if id exists and ensure it's a string
    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Article ID is required", ["Missing article ID"]));
    }
    // Ensure we have a string, not an array
    const articleId: string = Array.isArray(id) ? id[0] : id;

    const authorId = req.user!.id;

    const result = await deleteArticle(articleId, authorId);

    if (result.error) {
      return res.status(result.status || 400).json(result.response);
    }

    res.json(successResponse("Article deleted successfully", null));
  } catch (error) {
    console.error("Delete article error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to delete article"]),
      );
  }
};

export const getAllPublicArticlesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;

    const result = await getAllPublicArticles(page, pageSize, category);

    res.json(
      paginatedResponse(
        result.articles,
        page,
        pageSize,
        result.total,
        "Articles retrieved successfully",
      ),
    );
  } catch (error) {
    console.error("Get public articles error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to retrieve articles"]),
      );
  }
};

export const getArticleByIdController = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    // Fix: Check if id exists and ensure it's a string
    if (!id) {
      return res
        .status(400)
        .json(errorResponse("Article ID is required", ["Missing article ID"]));
    }
    // Ensure we have a string, not an array
    const articleId: string = Array.isArray(id) ? id[0] : id;

    const result = await getArticleById(articleId);

    if (result.error) {
      return res.status(result.status || 400).json(result.response);
    }

    res.json(successResponse("Article retrieved successfully", result.article));
  } catch (error) {
    console.error("Get article by id error:", error);
    res
      .status(500)
      .json(
        errorResponse("Internal server error", ["Failed to retrieve article"]),
      );
  }
};
