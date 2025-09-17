-- Supabase migration: products module
create extension if not exists "pgcrypto";

create table if not exists "Product" (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "slug" text not null,
  "sku" text,
  "description" text,
  "properties" jsonb not null default '{}'::jsonb,
  "prices" jsonb not null,
  "quantity" integer not null default 0,
  "isActive" boolean not null default true,
  "metadata" jsonb,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "Product_slug_key" unique ("slug"),
  constraint "Product_sku_key" unique ("sku"),
  constraint "Product_prices_currency" check (
    prices ? 'USD' and prices ? 'EUR' and
    (prices ->> 'USD')::numeric >= 0 and
    (prices ->> 'EUR')::numeric >= 0
  )
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$ language plpgsql;

create trigger set_product_updated_at
before update on "Product"
for each row execute function public.set_updated_at();
