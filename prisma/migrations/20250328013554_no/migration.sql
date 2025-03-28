/*
  Warnings:

  - Added the required column `expensesOriginal` to the `AnalyticsCacheMonthly` table without a default value. This is not possible if the table is not empty.
  - Added the required column `revenueOriginal` to the `AnalyticsCacheMonthly` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalyticsCacheMonthly" ADD COLUMN     "expensesOriginal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "revenueOriginal" DOUBLE PRECISION NOT NULL;
