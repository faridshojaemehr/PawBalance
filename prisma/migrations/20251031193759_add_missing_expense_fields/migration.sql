/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `itemName` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "createdAt",
DROP COLUMN "date",
ADD COLUMN     "itemName" TEXT NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "vendor" TEXT NOT NULL;
