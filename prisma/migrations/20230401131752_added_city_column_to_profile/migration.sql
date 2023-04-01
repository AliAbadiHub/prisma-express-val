/*
  Warnings:

  - Added the required column `city1` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city2` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city3` to the `UserProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city4` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "city1" TEXT NOT NULL,
ADD COLUMN     "city2" TEXT NOT NULL,
ADD COLUMN     "city3" TEXT NOT NULL,
ADD COLUMN     "city4" TEXT NOT NULL;
