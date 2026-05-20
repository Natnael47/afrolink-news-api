import Queue from "bull";
import { prisma } from "../lib/prisma.js";

const analyticsQueue = new Queue(
  "analytics",
  process.env.REDIS_URL || "redis://localhost:6379",
);

analyticsQueue.process(async (job) => {
  const { date } = job.data;
  console.log(`📊 Processing analytics for date: ${date}`);

  try {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const aggregates = await prisma.readLog.groupBy({
      by: ["articleId"],
      where: {
        readAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    console.log(`📊 Found ${aggregates.length} articles with reads on ${date}`);

    for (const agg of aggregates) {
      await prisma.dailyAnalytics.upsert({
        where: {
          articleId_date: {
            articleId: agg.articleId,
            date: startDate,
          },
        },
        update: {
          viewCount: agg._count.id,
        },
        create: {
          articleId: agg.articleId,
          date: startDate,
          viewCount: agg._count.id,
        },
      });
    }

    console.log(
      `✅ Processed analytics for ${date}: ${aggregates.length} articles updated`,
    );
    return { processed: aggregates.length, date };
  } catch (error) {
    console.error(`❌ Error processing analytics for ${date}:`, error);
    throw error;
  }
});

export const scheduleDailyAnalytics = () => {
  const scheduleNextJob = () => {
    const now = new Date();
    const nextMidnight = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0,
        0,
        0,
        0,
      ),
    );

    const delay = nextMidnight.getTime() - now.getTime();

    setTimeout(() => {
      const today = new Date().toISOString().split("T")[0];
      analyticsQueue.add({ date: today });
      console.log(`⏰ Scheduled analytics job for ${today}`);

      scheduleNextJob();
    }, delay);
  };

  scheduleNextJob();
  console.log("📅 Daily analytics scheduler started");
};

export const processYesterdayAnalytics = async () => {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  console.log(`🔄 Adding yesterday's analytics job for ${dateStr}`);
  await analyticsQueue.add({ date: dateStr });
  return dateStr;
};

export const getQueueStatus = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    analyticsQueue.getWaitingCount(),
    analyticsQueue.getActiveCount(),
    analyticsQueue.getCompletedCount(),
    analyticsQueue.getFailedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
  };
};

export { analyticsQueue };
