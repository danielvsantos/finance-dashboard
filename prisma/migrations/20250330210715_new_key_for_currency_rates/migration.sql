/*
  Warnings:

  - You are about to drop the column `expensesOriginal` on the `AnalyticsCacheMonthly` table. All the data in the column will be lost.
  - You are about to drop the column `revenueOriginal` on the `AnalyticsCacheMonthly` table. All the data in the column will be lost.
  - You are about to drop the column `fromCurrency` on the `CurrencyRate` table. All the data in the column will be lost.
  - You are about to drop the column `toUSD` on the `CurrencyRate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year,month,currencyFrom,currencyTo]` on the table `CurrencyRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `currencyFrom` to the `CurrencyRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyTo` to the `CurrencyRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `CurrencyRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CurrencyRate_year_month_fromCurrency_key";

-- AlterTable
ALTER TABLE "AnalyticsCacheMonthly" DROP COLUMN "expensesOriginal",
DROP COLUMN "revenueOriginal";

-- AlterTable
ALTER TABLE "CurrencyRate" DROP COLUMN "fromCurrency",
DROP COLUMN "toUSD",
ADD COLUMN     "currencyFrom" TEXT NOT NULL,
ADD COLUMN     "currencyTo" TEXT NOT NULL,
ADD COLUMN     "value" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_year_month_currencyFrom_currencyTo_key" ON "CurrencyRate"("year", "month", "currencyFrom", "currencyTo");
