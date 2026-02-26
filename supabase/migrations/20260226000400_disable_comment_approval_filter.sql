alter table if exists post_comments
  alter column status set default 'approved';

update post_comments
set status = 'approved'
where status = 'pending';

do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_read_approved'
  ) then
    drop policy "post_comments_read_approved" on post_comments;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_read_all'
  ) then
    drop policy "post_comments_read_all" on post_comments;
  end if;

  create policy "post_comments_read_all" on post_comments
    for select using (true);
end;
$$;
