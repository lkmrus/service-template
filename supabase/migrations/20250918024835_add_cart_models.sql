-- Create carts table
create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  author_id uuid,
  coupon_code text,
  metadata jsonb,
  merged_to_cart_id uuid,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table carts
  add constraint carts_merged_to_cart_id_fkey
  foreign key (merged_to_cart_id) references carts(id) on delete set null;

-- Create cart line item types lookup
create table if not exists cart_line_item_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create cart line items table
create table if not exists cart_line_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references carts(id) on delete set null,
  type_id uuid not null references cart_line_item_types(id) on delete restrict,
  parent_line_item_id uuid references cart_line_items(id) on delete set null,
  parent_bundle_id uuid references cart_line_items(id) on delete set null,
  order_stub_id text,
  external_uuid uuid,
  product_selection_params jsonb,
  price_usd numeric(18, 6),
  grace_period timestamptz,
  metadata jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cart_line_items_external_uuid_idx
  on cart_line_items(external_uuid) where external_uuid is not null;

create index if not exists cart_line_items_cart_id_idx on cart_line_items(cart_id);
create index if not exists cart_line_items_type_id_idx on cart_line_items(type_id);
create index if not exists cart_line_items_parent_line_item_id_idx on cart_line_items(parent_line_item_id);
create index if not exists cart_line_items_parent_bundle_id_idx on cart_line_items(parent_bundle_id);
