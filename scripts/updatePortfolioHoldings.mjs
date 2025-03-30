// scripts/updatePortfolioHoldings.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updatePortfolioHoldings() {
  try {
    const investmentTxns = await prisma.transaction.findMany({
      where: {
        category: {
          plMacroCategory: "Investments",
        },
        details: {
          in: ["Purchase", "Sale"],
        },
        ticker: {
          not: null,
        },
        numOfShares: {
          not: null,
        },
      },
      include: {
        account: true,
        category: true,
      },
    });

    const holdingsMap = {};

    for (const txn of investmentTxns) {
      const key = `${txn.account.name}-${txn.category.name}-${txn.ticker}`;
      const multiplier = txn.details === "Purchase" ? 1 : -1;
      const shares = txn.numOfShares * multiplier;

      if (!holdingsMap[key]) {
        holdingsMap[key] = {
          account: txn.account.name,
          category: txn.category.name,
          ticker: txn.ticker,
          sharesHeld: 0,
        };
      }

      holdingsMap[key].sharesHeld += shares;
    }

    await prisma.portfolioHolding.deleteMany(); // Clear existing

    const validHoldings = Object.values(holdingsMap).filter(h => h.sharesHeld > 0);

    for (const holding of validHoldings) {
      await prisma.portfolioHolding.create({
        data: holding,
      });
    }

    console.log(`✅ Portfolio holdings updated. ${validHoldings.length} active holdings saved.`);
  } catch (error) {
    console.error("❌ Error updating portfolio holdings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePortfolioHoldings();
