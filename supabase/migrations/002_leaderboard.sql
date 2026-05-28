create table if not exists leaderboard (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  email text,
  score integer not null default 0,
  wave integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Email is optional but used for deduplication and score accumulation
create index if not exists leaderboard_email_idx on leaderboard (email);
create index if not exists leaderboard_score_idx on leaderboard (score desc);
