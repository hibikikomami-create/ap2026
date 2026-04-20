-- ============================================================
-- 001_init.sql — MySheet 初期スキーマ
-- ============================================================

-- UUID 拡張
create extension if not exists "pgcrypto";

-- ─── users ────────────────────────────────────────────────────────────────────

create table public.users (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  display_name          text not null default '',
  company_name          text not null default '',
  company_address       text not null default '',
  company_phone         text not null default '',
  logo_url              text not null default '',
  tax_rate              numeric not null default 0.10,
  default_currency      text not null default 'JPY',
  default_payment_terms text not null default '',
  output_include_logo   boolean not null default false,
  output_include_tax    boolean not null default true,
  output_format         text not null default 'a4' check (output_format in ('a4', 'letter')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users: own row only"
  on public.users for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── projects ─────────────────────────────────────────────────────────────────

create table public.projects (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  name                text not null,
  business_type       text not null check (business_type in ('product', 'service')),
  sales_channels      text[] not null default '{}',
  user_role           text not null check (user_role in ('owner', 'production_manager', 'sales')),
  selected_cost_items text[] not null default '{}',
  deleted_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects: own rows only"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── products ─────────────────────────────────────────────────────────────────

create table public.products (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  project_id            uuid references public.projects(id) on delete set null,
  name                  text not null,
  code                  text not null default '',
  category              text not null default 'other',
  colors                text[] not null default '{}',
  sizes                 text[] not null default '{}',
  selling_price         numeric not null default 0,
  wholesale_price       numeric not null default 0,
  unit_cost             numeric not null default 0,
  monthly_fixed_cost    numeric not null default 0,
  payment_fee_rate      numeric not null default 0,
  discount_rate         numeric not null default 0,
  shipping_cost         numeric not null default 0,
  sales_channels        text[] not null default '{}',
  status                text not null default 'draft'
                          check (status in ('active', 'inactive', 'draft', 'discontinued')),
  expected_sales_volume numeric not null default 0,
  memo                  text not null default '',
  image_url             text not null default '',
  deleted_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: own rows only"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── cost_items ───────────────────────────────────────────────────────────────

create table public.cost_items (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  key        text not null,
  label      text not null,
  amount     numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cost_items enable row level security;

create policy "cost_items: own rows only"
  on public.cost_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── documents ────────────────────────────────────────────────────────────────

create table public.documents (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  project_id     uuid references public.projects(id) on delete set null,
  type           text not null default 'purchase_order'
                   check (type in ('purchase_order')),
  title          text not null,
  issue_date     date not null,
  due_date       date,
  recipient_name text not null default '',
  issuer_name    text not null default '',
  subtotal       numeric not null default 0,
  tax            numeric not null default 0,
  total          numeric not null default 0,
  memo           text not null default '',
  deleted_at     timestamptz,
  created_at     timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "documents: own rows only"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── document_items ───────────────────────────────────────────────────────────

create table public.document_items (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  product_id   uuid references public.products(id) on delete set null,
  product_name text not null,
  product_code text not null default '',
  quantity     numeric not null default 1,
  unit_price   numeric not null default 0,
  subtotal     numeric not null default 0,
  memo         text not null default '',
  sort_order   integer not null default 0
);

alter table public.document_items enable row level security;

create policy "document_items: via document owner"
  on public.document_items for all
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.documents d
      where d.id = document_id and d.user_id = auth.uid()
    )
  );

-- ─── exports ──────────────────────────────────────────────────────────────────

create table public.exports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  format      text not null check (format in ('pdf', 'excel', 'csv')),
  file_name   text not null,
  created_at  timestamptz not null default now()
);

alter table public.exports enable row level security;

create policy "exports: own rows only"
  on public.exports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_updated_at
  before update on public.users
  for each row execute procedure public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();
