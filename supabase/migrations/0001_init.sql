-- Supabase migration: initial schema (mirrors Prisma schema)
create extension if not exists "pgcrypto";

create table if not exists "User" (
  "id" uuid primary key default gen_random_uuid(),
  "email" text not null unique,
  "password" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "PreOrder" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"("id") on delete restrict on update cascade,
  "sellerId" uuid not null,
  "productId" uuid not null,
  "quantity" integer not null default 0,
  "totalPrice" numeric(12, 2) not null default 0,
  "currency" text not null,
  "commissions" jsonb not null,
  "calculatedCommissions" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Transaction" (
  "id" uuid primary key default gen_random_uuid(),
  "userId" uuid not null references "User"("id") on delete restrict on update cascade,
  "serviceAccountId" uuid not null,
  "amountIn" numeric(12, 2) not null default 0,
  "amountOut" numeric(12, 2) not null default 0,
  "currency" text not null,
  "status" text not null,
  "paymentMethod" text not null,
  "externalId" text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Order" (
  "id" uuid primary key default gen_random_uuid(),
  "preOrderId" uuid unique references "PreOrder"("id") on delete set null on update cascade,
  "transactionId" uuid unique references "Transaction"("id") on delete set null on update cascade,
  "userId" uuid not null references "User"("id") on delete restrict on update cascade,
  "sellerId" uuid not null,
  "productId" uuid not null,
  "quantity" integer not null default 0,
  "totalPrice" numeric(12, 2) not null default 0,
  "currency" text not null,
  "commissions" jsonb not null,
  "calculatedCommissions" jsonb,
  "status" text not null default 'paid',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "Balance" (
  "userId" uuid primary key references "User"("id") on delete restrict on update cascade,
  "amountIn" numeric(12, 2) not null default 0,
  "amountOut" numeric(12, 2) not null default 0
);

create table if not exists "Customer" (
  "customerId" text primary key,
  "userId" uuid not null unique references "User"("id") on delete restrict on update cascade
);

create table if not exists "Plan" (
  "planId" text primary key,
  "name" text not null,
  "description" text,
  "price" numeric(12, 2) not null,
  "currency" text not null,
  "interval" text not null
);

create table if not exists "Subscription" (
  "subscriptionId" text primary key,
  "customerId" text not null references "Customer"("customerId") on delete restrict on update cascade,
  "planId" text not null references "Plan"("planId") on delete restrict on update cascade,
  "status" text not null,
  "startDate" timestamptz not null,
  "endDate" timestamptz,
  "nextPaymentDate" timestamptz
);

create table if not exists "Invoice" (
  "invoiceId" text primary key,
  "subscriptionId" text not null references "Subscription"("subscriptionId") on delete restrict on update cascade,
  "amount" numeric(12, 2) not null,
  "status" text not null,
  "createdAt" timestamptz not null default now(),
  "pdfUrl" text
);

create table if not exists "Payment" (
  "paymentId" text primary key,
  "invoiceId" text not null references "Invoice"("invoiceId") on delete restrict on update cascade,
  "amount" numeric(12, 2) not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists "User_email_key" on "User"("email");
