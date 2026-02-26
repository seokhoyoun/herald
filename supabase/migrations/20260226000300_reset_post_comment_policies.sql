alter table if exists post_comments
  alter column status set default 'approved';

update post_comments
set status = 'approved'
where status = 'pending';

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'post_comments'
  loop
    execute format(
      'drop policy %I on post_comments',
      policy_row.policyname
    );
  end loop;

  create policy "post_comments_read_approved" on post_comments
    for select using (status = 'approved');

  create policy "post_comments_insert_authenticated" on post_comments
    for insert with check (auth.uid() = author_id);
end;
$$;

grant select on table post_comments to anon, authenticated;
grant insert on table post_comments to authenticated;
