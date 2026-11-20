/*
  Warnings:

  - You are about to drop the column `providerType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "providerType";

-- DropEnum
DROP TYPE "AuthProviderType";
