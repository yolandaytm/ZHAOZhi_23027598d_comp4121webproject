create table if not exists public.custom_meal_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  menu_item_slug text not null,
  title text not null,
  goal_tag text,
  customization jsonb not null default '{}'::jsonb,
  estimated_price integer not null default 0,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists custom_meal_presets_user_id_idx on public.custom_meal_presets(user_id);
create index if not exists custom_meal_presets_public_created_idx on public.custom_meal_presets(is_public, created_at desc);
