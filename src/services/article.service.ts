import { prisma } from "../lib/prisma.js";
import type {
  CreateArticleInput,
  UpdateArticleInput,
} from "../schemas/article.schema.js";
import { errorResponse } from "../utils/response.util.js";

export const createArticle = async (
  authorId: string,
  data: CreateArticleInput,
) => {
  const article = await prisma.article.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category,
      status: data.status,
      authorId: authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { error: false, article };
};

export const getMyArticles = async (
  authorId: string,
  page: number = 1,
  pageSize: number = 10,
) => {
  const skip = (page - 1) * pageSize;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: {
        authorId: authorId,
        deletedAt: null,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.article.count({
      where: {
        authorId: authorId,
        deletedAt: null,
      },
    }),
  ]);

  return { articles, total };
};

export const updateArticle = async (
  articleId: string,
  authorId: string,
  data: UpdateArticleInput,
) => {

  const existingArticle = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
      deletedAt: null,
    },
  });

  if (!existingArticle) {
    return {
      error: true,
      status: 404,
      response: errorResponse("Article not found", [
        "Article does not exist or you do not have permission",
      ]),
    };
  }

  // Build update data object - only include fields that are provided
  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.status !== undefined) updateData.status = data.status;

  const updatedArticle = await prisma.article.update({
    where: { id: articleId },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return { error: false, article: updatedArticle };
};

export const deleteArticle = async (articleId: string, authorId: string) => {
 
  const existingArticle = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
      deletedAt: null,
    },
  });

  if (!existingArticle) {
    return {
      error: true,
      status: 404,
      response: errorResponse("Article not found", [
        "Article does not exist or you do not have permission",
      ]),
    };
  }

  // Soft delete
  const deletedArticle = await prisma.article.update({
    where: { id: articleId },
    data: { deletedAt: new Date() },
  });

  return { error: false, article: deletedArticle };
};

export const getAllPublicArticles = async (
  page: number = 1,
  pageSize: number = 10,
  category?: string,
) => {
  const skip = (page - 1) * pageSize;

  const where: any = {
    status: "published",
    deletedAt: null,
  };

  if (category) {
    where.category = category;
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total };
};

export const getArticleById = async (articleId: string) => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      deletedAt: null,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!article) {
    return {
      error: true,
      status: 404,
      response: errorResponse("Article not found", ["Article does not exist"]),
    };
  }

  return { error: false, article };
};
