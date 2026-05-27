-- =====================================================================
-- Tabacaria do Muleta — Schema Supabase
-- Rode tudo dentro do SQL Editor do projeto Supabase.
-- =====================================================================

-- Extensões úteis
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Função is_admin() — SECURITY DEFINER pra evitar recursão em RLS
-- (policies que consultam profiles dentro de profiles dão problema)
-- ---------------------------------------------------------------------
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists(select 1 from profiles where id = uid and role = 'admin')
$$;

-- ---------------------------------------------------------------------
-- PROFILES: dados extras do usuário (ligados ao auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  birth_date date not null,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- Trigger: ao criar um auth.users, esperamos um profile correspondente
-- (criado via signUp com user_metadata). Sem trigger automático para
-- permitir validação 18+ no client antes de inserir.

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.is_admin(auth.uid())
  );

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- PRODUCTS: catálogo
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category) where active;

alter table public.products enable row level security;

drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
  on public.products for select
  using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write"
  on public.products for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- ORDERS: pedidos
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  payment_method text not null check (payment_method in ('pix','entrega')),
  shipping_cents integer not null default 0,
  subtotal_cents integer not null,
  total_cents integer not null,
  status text not null default 'em_aberto' check (status in ('em_aberto','entregue','cancelado')),
  customer_confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create index if not exists orders_status_idx on public.orders(status, created_at desc);
create index if not exists orders_customer_idx on public.orders(customer_id, status);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin"
  on public.orders for select
  using (
    customer_id = auth.uid()
    or public.is_admin(auth.uid())
  );

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (customer_id = auth.uid());

-- Cliente só pode marcar customer_confirmed (não muda status nem nada).
-- Admin pode atualizar qualquer coisa.
drop policy if exists "orders_update_customer_confirm" on public.orders;
create policy "orders_update_customer_confirm"
  on public.orders for update
  using (customer_id = auth.uid() and status = 'em_aberto')
  with check (customer_id = auth.uid() and status = 'em_aberto');

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- ORDER_ITEMS: itens de cada pedido (snapshot do produto)
-- ---------------------------------------------------------------------
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

create index if not exists order_items_order_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (o.customer_id = auth.uid()
             or public.is_admin(auth.uid()))
    )
  );

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own"
  on public.order_items for insert
  with check (
    exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid())
  );

-- ---------------------------------------------------------------------
-- SETTINGS: única linha (id=1) com configurações da loja
-- ---------------------------------------------------------------------
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  shop_name text not null default 'Tabacaria do Muleta',
  whatsapp_number text not null default '',
  pix_key text not null default '',
  pix_holder text not null default '',
  shipping_fee_cents integer not null default 1000,
  free_shipping_threshold_cents integer not null default 10000,
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists "settings_select_all" on public.settings;
create policy "settings_select_all"
  on public.settings for select
  using (true);

drop policy if exists "settings_admin_update" on public.settings;
create policy "settings_admin_update"
  on public.settings for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------
-- STORAGE: bucket público para fotos de produtos
-- (Rode também na aba Storage > New bucket: "products", público.
--  Estas policies cobrem o caso de já existir o bucket.)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "products_storage_read" on storage.objects;
create policy "products_storage_read"
  on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "products_storage_write_admin" on storage.objects;
create policy "products_storage_write_admin"
  on storage.objects for insert
  with check (
    bucket_id = 'products'
    and public.is_admin(auth.uid())
  );

drop policy if exists "products_storage_delete_admin" on storage.objects;
create policy "products_storage_delete_admin"
  on storage.objects for delete
  using (
    bucket_id = 'products'
    and public.is_admin(auth.uid())
  );
