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
      and policyname = 'post_comments_insert_pending'
  ) then
    drop policy "post_comments_insert_pending" on post_comments;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_insert_approved'
  ) then
    drop policy "post_comments_insert_approved" on post_comments;
  end if;

  create policy "post_comments_insert_approved" on post_comments
    for insert with check (
      auth.uid() = author_id
      and status = 'approved'
    );

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_read_approved'
  ) then
    drop policy "post_comments_read_approved" on post_comments;
  end if;

  create policy "post_comments_read_approved" on post_comments
    for select using (status = 'approved');
end;
$$;
