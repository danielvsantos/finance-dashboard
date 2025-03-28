-- CreateTable
CREATE TABLE "AnalyticsCache" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "expenses" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsCacheQuarterly" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "expenses" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCacheQuarterly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsCacheMonthly" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "expenses" DOUBLE PRECISION NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCacheMonthly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCache_year_currency_key" ON "AnalyticsCache"("year", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCacheQuarterly_year_quarter_currency_key" ON "AnalyticsCacheQuarterly"("year", "quarter", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCacheMonthly_year_month_currency_key" ON "AnalyticsCacheMonthly"("year", "month", "currency");
