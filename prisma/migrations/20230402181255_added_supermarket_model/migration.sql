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

-- CreateIndex
CREATE UNIQUE INDEX "Supermarket_supermarketName_key" ON "Supermarket"("supermarketName");

-- CreateIndex
CREATE INDEX "Supermarket_city_idx" ON "Supermarket"("city");

-- AddForeignKey
ALTER TABLE "Supermarket" ADD CONSTRAINT "Supermarket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supermarket" ADD CONSTRAINT "Supermarket_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
