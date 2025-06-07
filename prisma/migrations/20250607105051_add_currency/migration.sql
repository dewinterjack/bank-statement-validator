/*
  Warnings:

  - Added the required column `currency` to the `BankStatement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankStatement" ADD COLUMN     "currency" VARCHAR(3) NOT NULL;
