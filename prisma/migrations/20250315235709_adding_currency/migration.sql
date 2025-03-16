/*
  Warnings:

  - Added the required column `currency` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quarter` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "quarter" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
