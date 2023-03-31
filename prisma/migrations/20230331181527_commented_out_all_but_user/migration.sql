/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductPrice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supermarket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_supermarketId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPrice" DROP CONSTRAINT "ProductPrice_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "Supermarket" DROP CONSTRAINT "Supermarket_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Supermarket" DROP CONSTRAINT "Supermarket_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_userId_fkey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductPrice";

-- DropTable
DROP TABLE "Supermarket";

-- DropTable
DROP TABLE "UserProfile";

-- DropEnum
DROP TYPE "ActionType";

-- DropEnum
DROP TYPE "ProductCategory";
