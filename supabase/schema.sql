-- Supabase schema for post views + comments.

create type comment_status as enum ('pending', 'approved', 'spam', 'deleted');

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

create policy "post_stats_read" on post_stats
  for select using (true);

create policy "post_comments_read_approved" on post_comments
  for select using (status = 'approved');

create policy "post_comments_insert_pending" on post_comments
  for insert with check (
    auth.uid() = author_id
    and status = 'pending'
  );
