import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding database...");

  const author1 = await prisma.user.create({
    data: {
      name: "Daniel Tesfaye",
      email: "daniel@newsplatform.com",
      password: "hashed_password_123",
      role: "author",
    },
  });

  const author2 = await prisma.user.create({
    data: {
      name: "Sara Mekonnen",
      email: "sara@newsplatform.com",
      password: "hashed_password_456",
      role: "author",
    },
  });

  const reader1 = await prisma.user.create({
    data: {
      name: "Abel Kidane",
      email: "abel@gmail.com",
      password: "hashed_password_789",
      role: "reader",
    },
  });

  const reader2 = await prisma.user.create({
    data: {
      name: "Hana Solomon",
      email: "hana@gmail.com",
      password: "hashed_password_abc",
      role: "reader",
    },
  });

  console.log("👤 Users created");

  const article1 = await prisma.article.create({
    data: {
      title: "Ethiopia's Tech Industry is Growing Rapidly",
      content:
        "The tech ecosystem in Ethiopia is expanding with startups emerging in fintech, health tech, and logistics...",
      category: "Technology",
      status: "published",
      authorId: author1.id,
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: "New Infrastructure Projects Announced in Addis Ababa",
      content:
        "The city administration has announced several new road and housing development projects aimed at improving urban mobility...",
      category: "Politics",
      status: "published",
      authorId: author2.id,
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: "AI Education Becoming Popular in Universities",
      content:
        "Universities across Ethiopia are introducing artificial intelligence and data science programs to meet global demand...",
      category: "Education",
      status: "draft",
      authorId: author1.id,
    },
  });

  console.log("📰 Articles created");

  await prisma.readLog.createMany({
    data: [
      {
        articleId: article1.id,
        readerId: reader1.id,
        readAt: new Date(),
      },
      {
        articleId: article1.id,
        readerId: reader2.id,
        readAt: new Date(),
      },
      {
        articleId: article2.id,
        readerId: reader1.id,
        readAt: new Date(),
      },
      {
        articleId: article3.id,
        readerId: reader2.id,
        readAt: new Date(),
      },
    ],
  });

  console.log("📖 Read logs created");

  const today = new Date();

  await prisma.dailyAnalytics.createMany({
    data: [
      {
        articleId: article1.id,
        viewCount: 120,
        date: today,
      },
      {
        articleId: article2.id,
        viewCount: 85,
        date: today,
      },
      {
        articleId: article3.id,
        viewCount: 40,
        date: today,
      },
    ],
    skipDuplicates: true,
  });

  console.log("📊 Daily analytics created");

  const articles = await prisma.article.findMany({
    include: {
      author: true,
      readLogs: true,
      dailyAnalytics: true,
    },
  });

  console.log("✅ Seed complete. Articles summary:");
  console.log(JSON.stringify(articles, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  })
  .catch(async (e) => {
    console.error("❌ Error during seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
