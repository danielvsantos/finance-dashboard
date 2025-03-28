/*
  Warnings:

  - A unique constraint covering the columns `[year,month,fromCurrency]` on the table `CurrencyRate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `CurrencyRate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CurrencyRate_year_fromCurrency_key";

-- AlterTable
ALTER TABLE "CurrencyRate" ADD COLUMN     "month" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "CurrencyRate_year_month_fromCurrency_key" ON "CurrencyRate"("year", "month", "fromCurrency");
