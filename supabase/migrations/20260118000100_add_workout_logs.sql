create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  title text not null,
  content text not null,
  workout_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workout_logs_workout_date_idx
  on workout_logs (workout_date desc);

alter table workout_logs enable row level security;

create policy "workout_logs_read" on workout_logs
  for select using (true);

create policy "workout_logs_insert" on workout_logs
  for insert with check (auth.uid() = author_id);

create policy "workout_logs_update" on workout_logs
  for update using (auth.uid() = author_id);

create policy "workout_logs_delete" on workout_logs
  for delete using (auth.uid() = author_id);
