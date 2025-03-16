/*
  Warnings:

  - You are about to drop the column `account_name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `account_type` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `category_name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `card` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `day` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `pl_category` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `quarter` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `PLStatement` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `country` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plCategory` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PLStatement" DROP CONSTRAINT "PLStatement_categoryId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "account_name",
DROP COLUMN "account_type",
DROP COLUMN "created_at",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category_name",
DROP COLUMN "created_at",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "plCategory" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "card",
DROP COLUMN "created_at",
DROP COLUMN "day",
DROP COLUMN "month",
DROP COLUMN "pl_category",
DROP COLUMN "quarter",
DROP COLUMN "year",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "numOfShares" DOUBLE PRECISION,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "ticker" TEXT,
ADD COLUMN     "transfer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- DropTable
DROP TABLE "PLStatement";
