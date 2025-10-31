-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Admin users table (pre-approved Discord users)
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  discord_id text unique not null,
  discord_username text not null,
  discord_avatar text,
  created_at timestamp with time zone default now()
);

-- Events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  rules text[] default '{}',
  status text not null default 'active' check (status in ('active', 'closed')),
  closure_message text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Participants table
create table if not exists public.participants (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  email text,
  unique_link text unique not null,
  created_at timestamp with time zone default now()
);

-- Pairings table (who gives to whom)
create table if not exists public.pairings (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  giver_id uuid not null references public.participants(id) on delete cascade,
  receiver_id uuid not null references public.participants(id) on delete cascade,
  revealed boolean default false,
  revealed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(event_id, giver_id),
  unique(event_id, receiver_id),
  check (giver_id != receiver_id)
);

-- Enable Row Level Security
alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.participants enable row level security;
alter table public.pairings enable row level security;

-- RLS Policies for admin_users (only admins can view)
create policy "Admin users can view all admin users"
  on public.admin_users for select
  using (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

-- RLS Policies for events
create policy "Anyone can view active events"
  on public.events for select
  using (true);

create policy "Admins can insert events"
  on public.events for insert
  with check (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

create policy "Admins can update events"
  on public.events for update
  using (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

create policy "Admins can delete events"
  on public.events for delete
  using (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

-- RLS Policies for participants
create policy "Anyone can view participants"
  on public.participants for select
  using (true);

create policy "Admins can manage participants"
  on public.participants for all
  using (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

-- RLS Policies for pairings
create policy "Users can view their own pairing"
  on public.pairings for select
  using (
    exists (
      select 1 from public.participants
      where participants.id = pairings.giver_id
      and participants.unique_link = current_setting('request.jwt.claims', true)::json->>'link'
    )
  );

create policy "Admins can manage pairings"
  on public.pairings for all
  using (
    exists (
      select 1 from public.admin_users
      where discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

-- Create indexes for performance
create index if not exists idx_participants_event_id on public.participants(event_id);
create index if not exists idx_participants_unique_link on public.participants(unique_link);
create index if not exists idx_pairings_event_id on public.pairings(event_id);
create index if not exists idx_pairings_giver_id on public.pairings(giver_id);
create index if not exists idx_events_status on public.events(status);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_events_updated_at
  before update on public.events
  for each row
  execute function update_updated_at_column();
