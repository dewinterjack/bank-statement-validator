/*
  Warnings:

  - You are about to drop the column `s3Key` on the `BankStatement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BankStatement" DROP COLUMN "s3Key";

-- CreateTable
CREATE TABLE "StatementAnalysis" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "validations" JSONB NOT NULL DEFAULT '[]',
    "bankStatementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatementAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StatementAnalysis_s3Key_key" ON "StatementAnalysis"("s3Key");

-- CreateIndex
CREATE UNIQUE INDEX "StatementAnalysis_bankStatementId_key" ON "StatementAnalysis"("bankStatementId");

-- AddForeignKey
ALTER TABLE "StatementAnalysis" ADD CONSTRAINT "StatementAnalysis_bankStatementId_fkey" FOREIGN KEY ("bankStatementId") REFERENCES "BankStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
