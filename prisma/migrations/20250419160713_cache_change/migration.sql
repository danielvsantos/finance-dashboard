/*
  Warnings:

  - A unique constraint covering the columns `[year,month,currency,country,type,group]` on the table `AnalyticsCacheMonthly` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `group` to the `AnalyticsCacheMonthly` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AnalyticsCacheMonthly_year_month_currency_country_type_key";

-- AlterTable
ALTER TABLE "AnalyticsCacheMonthly" ADD COLUMN     "group" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsCacheMonthly_year_month_currency_country_type_grou_key" ON "AnalyticsCacheMonthly"("year", "month", "currency", "country", "type", "group");
