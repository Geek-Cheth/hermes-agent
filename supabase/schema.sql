-- Agent Autopilot schema
-- Run this in your Supabase SQL editor

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  idea text not null,
  status text not null default 'running' check (status in ('running', 'complete', 'error')),
  tasks jsonb not null default '{
    "competitor_research": "pending",
    "landing_page": "pending",
    "launch_posts": "pending",
    "agent_prompts": "pending"
  }'::jsonb,
  competitors_md text,
  landing_html text,
  posts_md text,
  agent_prompts_md text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists runs_created_at_idx on runs (created_at desc);
create index if not exists runs_user_id_idx on runs (user_id, created_at desc);

-- Migration for existing databases:
-- alter table runs add column if not exists user_id text;
-- create index if not exists runs_user_id_idx on runs (user_id, created_at desc);
-- alter table runs add column if not exists agent_prompts_md text;

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  run_id uuid references runs (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists waitlist_created_at_idx on waitlist (created_at desc);
