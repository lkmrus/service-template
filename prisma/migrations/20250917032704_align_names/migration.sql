-- Redefine Balance to use userId as primary key
ALTER TABLE "Balance" DROP CONSTRAINT IF EXISTS "Balance_pkey";
ALTER TABLE "Balance" DROP COLUMN IF EXISTS "id";
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_pkey" PRIMARY KEY ("userId");

-- Redefine Customer to use customerId as primary key
ALTER TABLE "Customer" DROP CONSTRAINT IF EXISTS "Customer_pkey";
ALTER TABLE "Customer" DROP COLUMN IF EXISTS "id";
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("customerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_userId_key" ON "Customer"("userId");

-- Plan id -> planId
ALTER TABLE "Plan" DROP CONSTRAINT IF EXISTS "Plan_pkey";
ALTER TABLE "Plan" RENAME COLUMN "id" TO "planId";
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_pkey" PRIMARY KEY ("planId");

-- Subscription id -> subscriptionId
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_pkey";
ALTER TABLE "Subscription" RENAME COLUMN "id" TO "subscriptionId";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscriptionId");
ALTER TABLE "Subscription" ALTER COLUMN "startDate" TYPE TIMESTAMP(3);
ALTER TABLE "Subscription" ALTER COLUMN "endDate" TYPE TIMESTAMP(3);
ALTER TABLE "Subscription" ALTER COLUMN "nextPaymentDate" TYPE TIMESTAMP(3);

-- Invoice id -> invoiceId
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_pkey";
ALTER TABLE "Invoice" RENAME COLUMN "id" TO "invoiceId";
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoiceId");
ALTER TABLE "Invoice" ALTER COLUMN "amount" TYPE DOUBLE PRECISION;
ALTER TABLE "Invoice" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3);

-- Payment id -> paymentId
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_pkey";
ALTER TABLE "Payment" RENAME COLUMN "id" TO "paymentId";
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId");
ALTER TABLE "Payment" ALTER COLUMN "amount" TYPE DOUBLE PRECISION;
ALTER TABLE "Payment" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3);
