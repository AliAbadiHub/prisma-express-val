-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'VERIFIED', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('Produce', 'Dairy', 'Butcher', 'Grocery', 'Confectionary');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BASIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "profileId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "address3" TEXT,
    "address4" TEXT,
    "dob" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "Product" (
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productCategory" "ProductCategory" NOT NULL,
    "productComments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedById" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Supermarket" (
    "supermarketId" TEXT NOT NULL,
    "supermarketName" TEXT NOT NULL,
    "supermarketComments" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "city" TEXT NOT NULL,

    CONSTRAINT "Supermarket_pkey" PRIMARY KEY ("supermarketId")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "productId" TEXT NOT NULL,
    "supermarketId" TEXT NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("supermarketId","productId")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "ActionType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_productName_key" ON "Product"("productName");

-- CreateIndex
CREATE UNIQUE INDEX "Supermarket_supermarketName_key" ON "Supermarket"("supermarketName");

-- CreateIndex
CREATE INDEX "Supermarket_city_idx" ON "Supermarket"("city");

-- CreateIndex
CREATE INDEX "ProductPrice_supermarketId_idx" ON "ProductPrice"("supermarketId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productId_supermarketId_key" ON "ProductPrice"("productId", "supermarketId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supermarket" ADD CONSTRAINT "Supermarket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supermarket" ADD CONSTRAINT "Supermarket_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_supermarketId_fkey" FOREIGN KEY ("supermarketId") REFERENCES "Supermarket"("supermarketId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
