-- Create reviews table
create table if not exists "Review" (
  "id" uuid primary key default gen_random_uuid(),
  "productId" uuid not null references "Product"("id") on delete cascade on update cascade,
  "userId" uuid not null references "User"("id") on delete cascade on update cascade,
  "review" text not null,
  "orderId" uuid references "Order"("id") on delete set null on update cascade,
  "rate" integer not null,
  "lang" text not null,
  "date" timestamptz not null default now(),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists "Review_productId_idx" on "Review"("productId");
create index if not exists "Review_userId_idx" on "Review"("userId");
create index if not exists "Review_orderId_idx" on "Review"("orderId");
