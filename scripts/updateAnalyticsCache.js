const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateAnalyticsCache() {
    try {
        const years = await prisma.transaction.findMany({
            distinct: ['year'],
            select: { year: true }
        });

        const targetCurrencies = ["USD", "EUR", "BRL"];

        for (const { year } of years) {
            const transactions = await prisma.transaction.findMany({
                where: { year },
                include: {
                    category: true,
                    account: true
                }
            });

            const rates = await prisma.currencyRate.findMany({
                where: { year }
            });

            const monthlyRates = {};
            for (const rate of rates) {
                if (!monthlyRates[rate.month]) monthlyRates[rate.month] = {};
                monthlyRates[rate.month][rate.fromCurrency] = rate.toUSD;
            }

            const aggregated = {};

            for (const txn of transactions) {
                const key = `${txn.year}-${txn.month}-${txn.account.country}`;
                const monthRates = monthlyRates[txn.month] || {};
                const fromRate = monthRates[txn.currency] || 1;
                const toRates = {};
                for (const targetCurrency of targetCurrencies) {
                    toRates[targetCurrency] = monthRates[targetCurrency] || 1;
                }

                const amountOriginal = (txn.credit || 0) - (txn.debit || 0);
                const category = txn.category?.plCategory || "Uncategorized";

                if (!aggregated[key]) {
                    aggregated[key] = {
                        year: txn.year,
                        month: txn.month,
                        country: txn.account.country,
                        byCurrency: {}
                    };
                }

                for (const currency of targetCurrencies) {
                    if (!aggregated[key].byCurrency[currency]) {
                        aggregated[key].byCurrency[currency] = {
                            revenue: 0,
                            expenses: 0,
                            revenueOriginal: 0,
                            expensesOriginal: 0,
                            data: {}
                        };
                    }

                    const normalizedAmount = amountOriginal / fromRate * toRates[currency];

                    if (txn.credit) {
                        aggregated[key].byCurrency[currency].revenue += normalizedAmount;
                        aggregated[key].byCurrency[currency].revenueOriginal += amountOriginal;
                    } else {
                        aggregated[key].byCurrency[currency].expenses += normalizedAmount;
                        aggregated[key].byCurrency[currency].expensesOriginal += amountOriginal;
                    }

                    aggregated[key].byCurrency[currency].data[category] =
                        (aggregated[key].byCurrency[currency].data[category] || 0) + normalizedAmount;
                }
            }

            for (const key in aggregated) {
                const { year, month, country, byCurrency } = aggregated[key];
                for (const currency in byCurrency) {
                    const entry = byCurrency[currency];

                    await prisma.analyticsCacheMonthly.upsert({
                        where: {
                            year_month_currency_country: {
                                year,
                                month,
                                currency,
                                country
                            }
                        },
                        update: {
                            revenue: entry.revenue,
                            expenses: entry.expenses,
                            revenueOriginal: entry.revenueOriginal,
                            expensesOriginal: entry.expensesOriginal,
                            data: entry.data,
                            updatedAt: new Date()
                        },
                        create: {
                            year,
                            month,
                            currency,
                            country,
                            revenue: entry.revenue,
                            expenses: entry.expenses,
                            revenueOriginal: entry.revenueOriginal,
                            expensesOriginal: entry.expensesOriginal,
                            data: entry.data,
                            updatedAt: new Date()
                        }
                    });
                }
            }

            console.log(`Updated cache for ${year}`);
        }

        console.log("Analytics cache update complete.");
    } catch (error) {
        console.error("Error updating analytics cache:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAnalyticsCache();
