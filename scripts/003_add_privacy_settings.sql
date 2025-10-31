-- Add privacy settings to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS hide_pairings_from_admins BOOLEAN DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN public.events.hide_pairings_from_admins IS 'When true, admins cannot see who is paired with whom, maintaining the surprise';
