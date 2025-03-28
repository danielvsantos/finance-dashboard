/*
  Warnings:

  - A unique constraint covering the columns `[year,month,currency,country]` on the table `AnalyticsCacheMonthly` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `AnalyticsCacheMonthly` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AnalyticsCacheMonthly_year_month_currency_key";

-- AlterTable
ALTER TABLE "AnalyticsCacheMonthly" ADD COLUMN     "country" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCacheMonthly_year_month_currency_country_key" ON "AnalyticsCacheMonthly"("year", "month", "currency", "country");
