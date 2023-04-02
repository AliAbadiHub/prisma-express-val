-- CreateTable
CREATE TABLE "Inventory" (
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedById" TEXT,
    "productId" TEXT NOT NULL,
    "supermarketId" TEXT NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("supermarketId","productId")
);

-- CreateIndex
CREATE INDEX "Inventory_supermarketId_idx" ON "Inventory"("supermarketId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_supermarketId_key" ON "Inventory"("productId", "supermarketId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_supermarketId_fkey" FOREIGN KEY ("supermarketId") REFERENCES "Supermarket"("supermarketId") ON DELETE RESTRICT ON UPDATE CASCADE;
