/*
  Warnings:

  - You are about to drop the column `data` on the `AnalyticsCacheMonthly` table. All the data in the column will be lost.
  - You are about to drop the column `expenses` on the `AnalyticsCacheMonthly` table. All the data in the column will be lost.
  - You are about to drop the column `revenue` on the `AnalyticsCacheMonthly` table. All the data in the column will be lost.
  - Added the required column `balance` to the `AnalyticsCacheMonthly` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AnalyticsCacheMonthly" DROP COLUMN "data",
DROP COLUMN "expenses",
DROP COLUMN "revenue",
ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL;
