import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';
import cliProgress from 'cli-progress';

dotenv.config();
const prisma = new PrismaClient();

const API_KEY = process.env.CURRENCYLAYER_API_KEY;
const BASE_URL = 'https://api.currencylayer.com/historical';
const TARGET_CURRENCIES = ['USD', 'EUR', 'BRL'];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchHistoricalRate({ year, month, currencyFrom, currencyTo }) {
  const date = `${year}-${String(month).padStart(2, '0')}-01`;
  const url = `${BASE_URL}?access_key=${API_KEY}&date=${date}&source=${currencyFrom}&currencies=${currencyTo}`;

  try {
    const response = await axios.get(url);
    if (!response.data.success || !response.data.quotes) return null;
    return response.data.quotes[`${currencyFrom}${currencyTo}`];
  } catch (err) {
    console.error(`❌ API error for ${currencyFrom}->${currencyTo} on ${date}:`, err.message);
    return null;
  }
}

async function updateAnalyticsCache() {
  try {
    console.log('🚀 Starting analytics cache update...');
    const distinctYears = await prisma.transaction.findMany({ distinct: ['year'], select: { year: true } });
    const years = distinctYears.map(y => y.year);

    const totalSteps = years.length * TARGET_CURRENCIES.length;
    const progressBar = new cliProgress.SingleBar({ format: 'Progress |{bar}| {percentage}% | {value}/{total} tasks' }, cliProgress.Presets.shades_classic);
    progressBar.start(totalSteps, 0);

    for (const year of years) {
      const transactions = await prisma.transaction.findMany({
        where: { year },
        include: { account: true, category: true }
      });

      const rates = await prisma.currencyRate.findMany({ where: { year } });
      const monthlyRates = {};
      for (const rate of rates) {
        monthlyRates[`${rate.year}-${rate.month}-${rate.currencyFrom}-${rate.currencyTo}`] = rate.value;
      }

      for (const targetCurrency of TARGET_CURRENCIES) {
        const cacheMap = {};

        for (const txn of transactions) {
          const { month, currency, account, category, credit = 0, debit = 0 } = txn;
          const amountRaw = credit - debit;

          let convertedAmount = amountRaw;
          if (currency !== targetCurrency) {
            const rateKey = `${year}-${month}-${currency}-${targetCurrency}`;
            let conversionRate = monthlyRates[rateKey];

            if (!conversionRate) {
              conversionRate = await fetchHistoricalRate({
                year,
                month,
                currencyFrom: currency,
                currencyTo: targetCurrency
              });

              if (conversionRate) {
                monthlyRates[rateKey] = conversionRate;

                await prisma.currencyRate.upsert({
                  where: {
                    year_month_currencyFrom_currencyTo: {
                      year,
                      month,
                      currencyFrom: currency,
                      currencyTo: targetCurrency
                    }
                  },
                  update: { value: conversionRate, updatedAt: new Date() },
                  create: {
                    year,
                    month,
                    currencyFrom: currency,
                    currencyTo: targetCurrency,
                    value: conversionRate
                  }
                });
              } else {
                continue;
              }

              await delay(1000); // respect rate limit
            }

            convertedAmount = amountRaw * conversionRate;
          }

          const country = account?.country || 'Unknown';
          const type = category?.type || 'Uncategorized';
          const group = category?.group || 'Uncategorized';
          const key = `${year}-${month}-${targetCurrency}-${country}-${type}-${group}`;

          if (!cacheMap[key]) {
            cacheMap[key] = {
              year,
              month,
              currency: targetCurrency,
              country,
              type,
              group,
              balance: 0
            };
          }

          cacheMap[key].balance += convertedAmount;
        }

        for (const entry of Object.values(cacheMap)) {
          await prisma.analyticsCacheMonthly.upsert({
            where: {
              year_month_currency_country_type_group: {
                year: entry.year,
                month: entry.month,
                currency: entry.currency,
                country: entry.country,
                type: entry.type,
                group: entry.group
              }
            },
            update: {
              balance: entry.balance,
              updatedAt: new Date()
            },
            create: {
              ...entry,
              updatedAt: new Date()
            }
          });
        }

        progressBar.increment();
      }
    }

    progressBar.stop();
    console.log('🎉 Analytics cache update complete.');
  } catch (error) {
    console.error('❌ Error updating analytics cache:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAnalyticsCache();
