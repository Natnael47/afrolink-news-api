import dotenv from "dotenv";
import { prisma } from "../src/lib/prisma";
// Load test environment
dotenv.config({ path: ".env.test" });

// Global setup before all tests
beforeAll(async () => {
  // Clean up database in correct order (respecting foreign keys)
  await prisma.readLog.deleteMany();
  await prisma.dailyAnalytics.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Test database cleaned");
});

// Global teardown after all tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log("✅ Test database disconnected");
});

export { prisma };
