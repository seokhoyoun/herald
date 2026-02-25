create table if not exists blog_daily_views (
  view_date date primary key,
  view_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function increment_blog_daily_view(p_view_date date default current_date)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count bigint;
begin
  insert into blog_daily_views (view_date, view_count, updated_at)
  values (p_view_date, 1, now())
  on conflict (view_date)
  do update set
    view_count = blog_daily_views.view_count + 1,
    updated_at = now()
  returning view_count into next_count;

  return next_count;
end;
$$;

grant execute on function increment_blog_daily_view(date) to anon, authenticated;

alter table blog_daily_views enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blog_daily_views'
      and policyname = 'blog_daily_views_read'
  ) then
    create policy "blog_daily_views_read" on blog_daily_views
      for select using (true);
  end if;
end;
$$;
