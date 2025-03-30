import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const targetCurrencies = ["USD", "EUR", "BRL"];

async function checkMissingCurrencyRates() {
  try {
    const transactions = await prisma.transaction.findMany({
      select: {
        year: true,
        month: true,
        currency: true,
      },
      distinct: ["year", "month", "currency"],
    });

    const existingRates = await prisma.currencyRate.findMany();
    const existingKeys = new Set(
      existingRates.map(
        (r) =>
          `${r.year}-${r.month}-${r.currencyFrom}-${r.currencyTo}`
      )
    );

    const missing = [];

    for (const tx of transactions) {
      for (const targetCurrency of targetCurrencies) {
        if (tx.currency === targetCurrency) continue;

        const key = `${tx.year}-${tx.month}-${tx.currency}-${targetCurrency}`;
        if (!existingKeys.has(key)) {
          missing.push({
            year: tx.year,
            month: tx.month,
            currencyFrom: tx.currency,
            currencyTo: targetCurrency,
          });
        }
      }
    }

    if (missing.length === 0) {
      console.log("✅ All required currency rate combinations are present.");
    } else {
      console.log("❌ Missing currency rate entries:");
      console.table(missing);
    }
  } catch (err) {
    console.error("Error checking missing currency rates:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingCurrencyRates();
