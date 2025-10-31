# Secret Santa App Setup Guide

## Prerequisites

1. A Supabase or Neon database (already connected via v0)
2. Discord and/or Google OAuth applications
3. WhatsApp API credentials (optional, for sending links via WhatsApp)
4. SMTP credentials (optional, for sending links via email)

## Database Setup

1. Run the SQL scripts in order to create tables:
   - `scripts/001_create_tables.sql` - Core tables
   - `scripts/002_fix_rls_policies.sql` - Fix RLS policies
   - `scripts/003_add_privacy_settings.sql` - Privacy features
   - `scripts/004_add_auth_codes.sql` - Auth code system
   - `scripts/005_enhanced_admin_system.sql` - Enhanced admin features
   
   In v0, you can run these scripts directly from the interface, or copy the SQL and run it in your Supabase/Neon dashboard.

## Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Secret Santa Admin")
3. Go to the "OAuth2" section
4. Add redirect URLs:
   - For development: `http://localhost:3000/api/auth/discord/callback`
   - For production: `https://yourdomain.com/api/auth/discord/callback`
5. Copy your Client ID and Client Secret
6. Add them to your environment variables:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/api/auth/google/callback`
   - For production: `https://yourdomain.com/api/auth/google/callback`
6. Copy your Client ID and Client Secret
7. Add them to your environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## System Owner Setup

The first admin to log in when no admins exist will be prompted to claim system ownership:

1. Start the application
2. Check the server console for a generated ownership code
3. Navigate to `/admin/setup-owner`
4. Enter the code from the console
5. You are now the system owner and can add other admins

## Adding Admin Users (System Owner Only)

As the system owner, you can add admins dynamically:

1. Log in to the admin panel
2. Navigate to the admin management section
3. Add either:
   - Discord User ID (enable Developer Mode in Discord, right-click username, "Copy User ID")
   - Google email address
4. The next time that user logs in, they will be granted admin access

## WhatsApp Integration (Optional)

To enable sending participant links via WhatsApp:

1. Set up a WhatsApp Business API account (e.g., Twilio, Meta Business)
2. Add environment variables:
   - `WHATSAPP_API_URL` - Your WhatsApp API endpoint
   - `WHATSAPP_API_KEY` - Your API key
   - `WHATSAPP_PHONE_NUMBER_ID` - Your WhatsApp phone number ID

## Email Integration (Optional)

To enable sending participant links via email:

1. Set up an SMTP provider (ZeptoMail recommended)
2. Add environment variables:
   - `SMTP_HOST` - SMTP server host (e.g., smtp.zeptomail.com)
   - `SMTP_PORT` - SMTP port (usually 587)
   - `SMTP_USER` - SMTP username
   - `SMTP_PASSWORD` - SMTP password
   - `SMTP_FROM_EMAIL` - From email address
   - `SMTP_FROM_NAME` - From name (e.g., "Secret Santa")

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` (automatically set by integration)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (automatically set by integration)
- `SUPABASE_SERVICE_ROLE_KEY` (automatically set by integration)
- `SESSION_SECRET` (generate a random 32+ character string)

OAuth (at least one required):
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Optional:
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (for local development: `http://localhost:3000`)
- `WHATSAPP_API_URL`
- `WHATSAPP_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `NEXT_PUBLIC_APP_URL` (your app's public URL)

## Features

### User Features
- **Multi-language Support**: Automatic language detection (English/Spanish) with manual switcher
- **Mobile Optimized**: Fully responsive design optimized for phone usage
- **Enhanced Animations**: Emoji-cycling reveal animation for Secret Santa pairings
- **Auth Codes**: Optional authentication codes to prevent link hijacking
- **Auto-redirect**: Automatic redirect to pairing page for returning users

### Admin Features
- **Dual OAuth**: Login with Discord or Google
- **Dynamic Admin Management**: System owner can add/remove admins
- **Privacy Settings**: Hide pairings from admins to preserve the surprise
- **Presentation Mode**: TV-friendly roulette-style reveal for gatherings
- **Messaging Integration**: Send participant links via WhatsApp or email
- **System Health Dashboard**: Test messaging and view audit logs
- **Event Management**: Create, edit, and close events with custom rules

## Testing

1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000/admin/login`
3. Sign in with Discord or Google
4. If you're the first admin, claim system ownership
5. Create an event and add participants
6. Test the system health dashboard to verify messaging

## Deployment

1. Push your code to GitHub
2. Deploy to Vercel
3. Add production redirect URLs to Discord and Google OAuth apps
4. Set all environment variables in Vercel project settings
5. Run database migrations if not already done
6. Your Secret Santa app is ready!

## Troubleshooting

- **RLS Policy Errors**: Make sure you've run all SQL migration scripts in order
- **OAuth Errors**: Verify redirect URLs match exactly in OAuth app settings
- **Messaging Failures**: Check System Health dashboard and verify API credentials
- **Font Warnings**: These are harmless and won't affect functionality
