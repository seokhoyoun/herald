create or replace function increment_blog_daily_view(
  p_view_date date default (timezone('Asia/Seoul', now())::date)
)
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
