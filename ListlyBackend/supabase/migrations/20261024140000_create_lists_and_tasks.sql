create table public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  category text not null check (
    category in ('Compras', 'Universidad', 'Hogar', 'Viaje', 'Trabajo', 'Personal', 'General')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lists_id_user_id_key unique (id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  list_id uuid not null,
  name text not null check (btrim(name) <> ''),
  quantity integer not null default 1 check (quantity >= 1),
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_list_owner_fkey
    foreign key (list_id, user_id)
    references public.lists (id, user_id)
    on delete cascade,
  constraint tasks_completed_at_consistency
    check (completed = (completed_at is not null))
);

create index lists_user_created_at_idx on public.lists (user_id, created_at desc);
create index tasks_user_list_created_at_idx on public.tasks (user_id, list_id, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lists_set_updated_at
before update on public.lists
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

alter table public.lists enable row level security;
alter table public.tasks enable row level security;

create policy "Users can manage their own lists"
on public.lists
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own tasks"
on public.tasks
for all
to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.lists
    where lists.id = tasks.list_id
      and lists.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.lists to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.lists to service_role;
grant all on public.tasks to service_role;

revoke all on public.lists from anon;
revoke all on public.tasks from anon;
