import { prisma } from "../lib/prisma.js";

export const getAuthorDashboard = async (authorId: string) => {
  // Get all articles by this author
  const articles = await prisma.article.findMany({
    where: {
      authorId: authorId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      readLogs: {
        select: {
          id: true,
          readAt: true,
        },
      },
    },
  });

  // Calculate total reads across all articles
  const totalReads = articles.reduce(
    (sum, article) => sum + article.readLogs.length,
    0,
  );

  // Get daily analytics for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyStats = await prisma.dailyAnalytics.findMany({
    where: {
      articleId: {
        in: articles.map((a) => a.id),
      },
      date: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Get top performing article - FIXED
  let topArticle = null;
  if (articles.length > 0) {
    topArticle = articles.reduce((top, article) => {
      if (!top) return article;
      return article.readLogs.length > top.readLogs.length ? article : top;
    }, articles[0]);
  }

  return {
    totalArticles: articles.length,
    publishedArticles: articles.filter((a) => a.status === "published").length,
    draftArticles: articles.filter((a) => a.status === "draft").length,
    totalReads: totalReads,
    averageReadsPerArticle:
      articles.length > 0 ? totalReads / articles.length : 0,
    topArticle: topArticle
      ? {
          id: topArticle.id,
          title: topArticle.title,
          reads: topArticle.readLogs.length,
        }
      : null,
    recentDailyStats: dailyStats,
  };
};

export const getArticleAnalytics = async (
  articleId: string,
  authorId: string,
) => {
  // Verify article belongs to author
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      authorId: authorId,
      deletedAt: null,
    },
    include: {
      readLogs: {
        orderBy: {
          readAt: "desc",
        },
        take: 10,
      },
      dailyAnalytics: {
        orderBy: {
          date: "desc",
        },
        take: 30,
      },
    },
  });

  if (!article) {
    return { error: true, message: "Article not found" };
  }

  return {
    error: false,
    analytics: {
      articleId: article.id,
      title: article.title,
      totalReads: article.readLogs.length,
      recentReads: article.readLogs,
      dailyViews: article.dailyAnalytics,
      category: article.category,
      status: article.status,
    },
  };
};
