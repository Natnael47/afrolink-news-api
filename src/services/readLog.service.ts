import { prisma } from "../lib/prisma.js";

export const trackArticleRead = async (
  articleId: string,
  readerId?: string,
) => {
  const readLog = await prisma.readLog.create({
    data: {
      articleId: articleId,
      readerId: readerId || null,
    },
  });

  return readLog;
};

export const getArticleReadCount = async (articleId: string) => {
  const count = await prisma.readLog.count({
    where: {
      articleId: articleId,
    },
  });

  return count;
};
