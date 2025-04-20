import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAnalyticsCache() {
  try {
    const deleted = await prisma.analyticsCacheMonthly.deleteMany();
    console.log(`🗑️ Cleared ${deleted.count} entries from analyticsCacheMonthly.`);
  } catch (error) {
    console.error('❌ Error clearing analytics cache:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAnalyticsCache();
