-- Create carts table
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

-- Create cart line items table
CREATE TABLE "CartLineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cartId" TEXT,
    "preOrderId" TEXT,
    "externalUuid" TEXT,
    "productSelectionParams" JSONB,
    "priceUSD" DOUBLE PRECISION,
    "metadata" JSONB,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CartLineItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "CartLineItem_cartId_idx" ON "CartLineItem"("cartId");
CREATE UNIQUE INDEX "CartLineItem_externalUuid_idx" ON "CartLineItem"("externalUuid") WHERE "externalUuid" IS NOT NULL;
