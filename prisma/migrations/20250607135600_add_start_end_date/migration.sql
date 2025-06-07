/*
  Warnings:

  - You are about to drop the column `documentDate` on the `BankStatement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[startDate,endDate,accountNumber]` on the table `BankStatement` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `BankStatement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `BankStatement` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "BankStatement_documentDate_accountNumber_key";

-- AlterTable
ALTER TABLE "BankStatement" DROP COLUMN "documentDate",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BankStatement_startDate_endDate_accountNumber_key" ON "BankStatement"("startDate", "endDate", "accountNumber");
