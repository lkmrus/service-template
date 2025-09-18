-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT,
    "authorId" TEXT,
    "couponCode" TEXT,
    "metadata" JSONB,
    "mergedToCartId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cart_mergedToCartId_fkey" FOREIGN KEY ("mergedToCartId") REFERENCES "Cart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CartLineItemType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "CartLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT,
    "typeId" TEXT NOT NULL,
    "parentLineItemId" TEXT,
    "parentBundleId" TEXT,
    "orderStubId" TEXT,
    "externalUuid" TEXT,
    "productSelectionParams" JSONB,
    "priceUSD" DECIMAL,
    "gracePeriod" TIMESTAMP(3),
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CartLineItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CartLineItem_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CartLineItemType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CartLineItem_parentLineItemId_fkey" FOREIGN KEY ("parentLineItemId") REFERENCES "CartLineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CartLineItem_parentBundleId_fkey" FOREIGN KEY ("parentBundleId") REFERENCES "CartLineItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CartLineItemType_code_key" ON "CartLineItemType"("code");
