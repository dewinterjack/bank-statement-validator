/*
  Warnings:

  - You are about to drop the column `validations` on the `StatementAnalysis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StatementAnalysis" DROP COLUMN "validations";

-- CreateTable
CREATE TABLE "CalculatedValidation" (
    "id" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "reasoning" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "additionalDetails" JSONB,
    "statementAnalysisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatedValidation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIValidation" (
    "id" TEXT NOT NULL,
    "confidence" SMALLINT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "reasoning" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "additionalDetails" JSONB,
    "statementAnalysisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIValidation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CalculatedValidation" ADD CONSTRAINT "CalculatedValidation_statementAnalysisId_fkey" FOREIGN KEY ("statementAnalysisId") REFERENCES "StatementAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIValidation" ADD CONSTRAINT "AIValidation_statementAnalysisId_fkey" FOREIGN KEY ("statementAnalysisId") REFERENCES "StatementAnalysis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
