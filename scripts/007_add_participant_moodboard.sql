-- Add moodboard column to participants table
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS moodboard text[] DEFAULT '{}';

-- No special indexes required for text[]; leave RLS policies intact
