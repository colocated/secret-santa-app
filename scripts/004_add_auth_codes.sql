-- Add phone number and auth code fields to participants table
ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+1';

-- Create auth codes table
CREATE TABLE IF NOT EXISTS public.auth_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add auth code settings to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS require_auth_code BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auth_code_expiry_hours INTEGER DEFAULT 24;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_codes_participant_id ON public.auth_codes(participant_id);
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON public.auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_codes_expires_at ON public.auth_codes(expires_at);

-- Enable RLS
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_codes
CREATE POLICY "Anyone can verify auth codes"
  ON public.auth_codes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage auth codes"
  ON public.auth_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE discord_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
    )
  );

-- Function to clean up expired auth codes
CREATE OR REPLACE FUNCTION cleanup_expired_auth_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.auth_codes
  WHERE expires_at < NOW() AND verified = FALSE;
END;
$$ LANGUAGE plpgsql;
