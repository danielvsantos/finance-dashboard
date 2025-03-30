/*
  Warnings:

  - You are about to drop the column `entity` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `newData` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `oldData` on the `AuditLog` table. All the data in the column will be lost.
  - Added the required column `payload` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recordId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `table` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "entity",
DROP COLUMN "entityId",
DROP COLUMN "newData",
DROP COLUMN "oldData",
ADD COLUMN     "payload" TEXT NOT NULL,
ADD COLUMN     "recordId" INTEGER NOT NULL,
ADD COLUMN     "table" TEXT NOT NULL;
