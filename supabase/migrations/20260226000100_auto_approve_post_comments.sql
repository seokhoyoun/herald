alter table if exists post_comments
  alter column status set default 'approved';

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

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
      and policyname = 'post_comments_insert_approved'
  ) then
    create policy "post_comments_insert_approved" on post_comments
      for insert with check (
        auth.uid() = author_id
        and status = 'approved'
      );
  end if;
end;
$$;
