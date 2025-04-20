// testClient.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const fields = Object.keys(prisma.analyticsCacheMonthly.fields || {});
  console.log("Fields in AnalyticsCacheMonthly:", fields);
}

test();