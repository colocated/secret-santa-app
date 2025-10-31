ALTER TABLE public.admin_users
  ALTER COLUMN discord_username DROP NOT NULL;

ALTER TABLE public.admin_users
  ADD CONSTRAINT admin_users_must_have_discord_or_google
    CHECK (discord_id IS NOT NULL OR google_id IS NOT NULL);
