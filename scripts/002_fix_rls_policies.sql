-- Fix infinite recursion in admin_users RLS policy
-- Drop the problematic policy
drop policy if exists "Admin users can view all admin users" on public.admin_users;

-- Create a simpler policy that allows service role to manage admin_users
-- Since we're using server-side session management, we'll bypass RLS for admin operations
create policy "Service role can manage admin users"
  on public.admin_users for all
  using (true)
  with check (true);

-- Update other policies to be less restrictive for server-side operations
-- Drop existing policies that reference admin_users
drop policy if exists "Admins can insert events" on public.events;
drop policy if exists "Admins can update events" on public.events;
drop policy if exists "Admins can delete events" on public.events;
drop policy if exists "Admins can manage participants" on public.participants;
drop policy if exists "Admins can manage pairings" on public.pairings;

-- Create new policies that allow service role to manage everything
-- (Server-side code will handle authorization)
create policy "Service role can insert events"
  on public.events for insert
  with check (true);

create policy "Service role can update events"
  on public.events for update
  using (true);

create policy "Service role can delete events"
  on public.events for delete
  using (true);

create policy "Service role can manage participants"
  on public.participants for all
  using (true);

create policy "Service role can manage pairings"
  on public.pairings for all
  using (true);
