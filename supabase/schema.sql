-- Supabase schema for post views + comments.

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'comment_status'
  ) then
    create type comment_status as enum ('pending', 'approved', 'spam', 'deleted');
  end if;
end;
$$;

create table if not exists post_stats (
  slug text primary key,
  view_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  author_id uuid not null,
  author_name text null,
  body text not null,
  status comment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists post_comments_post_slug_idx
  on post_comments (post_slug);
create index if not exists post_comments_created_at_idx
  on post_comments (created_at desc);

create or replace function increment_post_view(p_slug text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count bigint;
begin
  insert into post_stats (slug, view_count, updated_at)
  values (p_slug, 1, now())
  on conflict (slug)
  do update set
    view_count = post_stats.view_count + 1,
    updated_at = now()
  returning view_count into next_count;

  return next_count;
end;
$$;

alter table post_stats enable row level security;
alter table post_comments enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_stats'
      and policyname = 'post_stats_read'
  ) then
    create policy "post_stats_read" on post_stats
      for select using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_read_approved'
  ) then
    create policy "post_comments_read_approved" on post_comments
      for select using (status = 'approved');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_insert_pending'
  ) then
    create policy "post_comments_insert_pending" on post_comments
      for insert with check (
        auth.uid() = author_id
        and status = 'pending'
      );
  end if;
end;
$$;

create table if not exists workout_logs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  title text not null,
  content text not null,
  workout_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workout_logs_workout_date_idx
  on workout_logs (workout_date desc);

alter table workout_logs enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_logs'
      and policyname = 'workout_logs_read'
  ) then
    create policy "workout_logs_read" on workout_logs
      for select using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_logs'
      and policyname = 'workout_logs_insert'
  ) then
    create policy "workout_logs_insert" on workout_logs
      for insert with check (auth.uid() = author_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_logs'
      and policyname = 'workout_logs_update'
  ) then
    create policy "workout_logs_update" on workout_logs
      for update using (auth.uid() = author_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'workout_logs'
      and policyname = 'workout_logs_delete'
  ) then
    create policy "workout_logs_delete" on workout_logs
      for delete using (auth.uid() = author_id);
  end if;
end;
$$;
