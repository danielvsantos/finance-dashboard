import { PrismaClient } from "@prisma/client";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const API_KEY = process.env.CURRENCYLAYER_API_KEY;
const BASE_URL = "https://api.currencylayer.com/historical";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHistoricalRate({ year, month, currencyFrom, currencyTo }) {
  const date = `${year}-${String(month).padStart(2, "0")}-01`;
  const url = `${BASE_URL}?access_key=${API_KEY}&date=${date}&source=${currencyFrom}&currencies=${currencyTo}`;

  try {
    const response = await axios.get(url);
    if (!response.data.success || !response.data.quotes) {
      console.warn(`⚠️ Could not fetch rate for ${currencyFrom} to ${currencyTo} on ${date}`);
      console.log("Full API response:", JSON.stringify(response.data, null, 2));
      return null;
    }

    const rateKey = `${currencyFrom}${currencyTo}`;
    const rate = response.data.quotes[rateKey];
    console.log(`💱 Fetched rate ${currencyFrom} to ${currencyTo} on ${date}: ${rate}`);
    return rate;
  } catch (err) {
    console.error(`❌ API error for ${currencyFrom}-${currencyTo} on ${date}:`, err.message);
    return null;
  }
}

async function updateAnalyticsCache() {
  try {
    const years = await prisma.transaction.findMany({
      distinct: ["year"],
      select: { year: true },
    });

    const targetCurrencies = ["USD", "EUR", "BRL"];
    const missingRates = new Set();

    // Step 1: Analyze transactions to find missing currency rates
    for (const { year } of years) {
      const transactions = await prisma.transaction.findMany({
        where: { year },
        include: { category: true, account: true },
      });

      for (const txn of transactions) {
        for (const targetCurrency of targetCurrencies) {
          if (txn.currency !== targetCurrency) {
            const key = `${txn.year}-${txn.month}-${txn.currency}-${targetCurrency}`;
            const exists = await prisma.currencyRate.findFirst({
              where: {
                year: txn.year,
                month: txn.month,
                currencyFrom: txn.currency,
                currencyTo: targetCurrency,
              },
            });
            if (!exists) {
              missingRates.add(key);
            }
          }
        }
      }
    }

    // Step 2: Fetch missing historical rates and store in DB
    for (const key of missingRates) {
      const [year, month, currencyFrom, currencyTo] = key.split("-");

      if (currencyFrom === currencyTo) {
        console.log(`🔁 Skipping same-currency rate: ${currencyFrom} to ${currencyTo}`);
        continue;
      }

      const alreadyExists = await prisma.currencyRate.findFirst({
        where: {
          year: parseInt(year),
          month: parseInt(month),
          currencyFrom,
          currencyTo,
        },
      });

      if (alreadyExists) {
        console.log(`✔️ Skipping already existing rate: ${currencyFrom} to ${currencyTo} for ${month}/${year}`);
        continue;
      }

      const value = await fetchHistoricalRate({
        year: parseInt(year),
        month: parseInt(month),
        currencyFrom,
        currencyTo,
      });

      await delay(1000);

      if (!value) continue;

      await prisma.currencyRate.upsert({
        where: {
          year_month_currencyFrom_currencyTo: {
            year: parseInt(year),
            month: parseInt(month),
            currencyFrom,
            currencyTo,
          },
        },
        update: { value, updatedAt: new Date() },
        create: {
          year: parseInt(year),
          month: parseInt(month),
          currencyFrom,
          currencyTo,
          value,
        },
      });

      console.log(`💾 Rate saved: ${currencyFrom} to ${currencyTo} for ${month}/${year}`);
    }

    // Step 3: Calculate analytics cache
    for (const { year } of years) {
      const transactions = await prisma.transaction.findMany({
        where: { year },
        include: { category: true, account: true },
      });

      const rates = await prisma.currencyRate.findMany({ where: { year } });
      const monthlyRates = {};
      for (const rate of rates) {
        const key = `${rate.year}-${rate.month}-${rate.currencyFrom}-${rate.currencyTo}`;
        monthlyRates[key] = rate.value;
      }

      for (const targetCurrency of targetCurrencies) {
        const cacheMap = {};

        for (const txn of transactions) {
          const { year, month, currency, account, category } = txn;
          const country = account?.country || "Unknown";
          const plMacroCategory = category?.plMacroCategory || "Uncategorized";
          const plCategory = category?.plCategory || "Uncategorized";

          let amountConverted = (txn.credit || 0) - (txn.debit || 0);

          if (currency !== targetCurrency) {
            const rateKey = `${year}-${month}-${currency}-${targetCurrency}`;
            const rate = monthlyRates[rateKey];
            if (!rate) {
              console.warn(`⚠️ Missing conversion rate for ${rateKey}. Skipping transaction.`);
              continue;
            }
            amountConverted *= rate;
          }

          const key = `${year}-${month}-${targetCurrency}-${country}-${plMacroCategory}`;

          if (!cacheMap[key]) {
            cacheMap[key] = {
              year,
              month,
              currency: targetCurrency,
              country,
              plMacroCategory,
              revenue: 0,
              expenses: 0,
              data: {},
            };
          }

          const cache = cacheMap[key];

          if (!cache.data[plCategory]) {
            cache.data[plCategory] = {
              revenue: 0,
              expenses: 0,
            };
          }

          if (txn.credit) {
            cache.revenue += amountConverted;
            cache.data[plCategory].revenue += amountConverted;
          }

          if (txn.debit) {
            cache.expenses += amountConverted;
            cache.data[plCategory].expenses += amountConverted;
          }
        }

        for (const entry of Object.values(cacheMap)) {
          if (entry.currency !== targetCurrency) continue;

          await prisma.analyticsCacheMonthly.upsert({
            where: {
              year_month_currency_country_plMacroCategory: {
                year: entry.year,
                month: entry.month,
                currency: entry.currency,
                country: entry.country,
                plMacroCategory: entry.plMacroCategory,
              },
            },
            update: {
              revenue: entry.revenue,
              expenses: entry.expenses,
              data: entry.data,
              updatedAt: new Date(),
            },
            create: {
              ...entry,
              updatedAt: new Date(),
            },
          });
        }

        console.log(`✅ Cache updated for ${year} in ${targetCurrency}`);
      }
    }
  } catch (error) {
    console.error("❌ Error updating analytics cache:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAnalyticsCache();
