/*
  Warnings:

  - Made the column `userId` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ALTER COLUMN "userId" SET NOT NULL;
