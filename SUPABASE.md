# Supabase Integration Guide

This guide covers setting up and using Supabase with Selestial.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be provisioned (this takes a few minutes)

### 2. Get Your API Keys

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (this is safe to use in the browser)
   - **service_role** key (keep this secret - server-side only)

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. Run Database Migrations

Using the Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually in the Supabase Dashboard:
1. Go to **SQL Editor**
2. Run each migration file in order from `supabase/migrations/`

### 5. Start the Application

```bash
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anonymous key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server-side only) |

**Security Note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. It bypasses Row Level Security.

## Local Development

### Using Supabase CLI (Recommended)

The Supabase CLI allows you to run a local Supabase instance:

```bash
# Start local Supabase
supabase start

# This will output local URLs and keys
# Update your .env.local with these values

# Stop local Supabase
supabase stop
```

Local services will be available at:
- **Studio**: http://localhost:54323
- **API**: http://localhost:54321
- **Database**: postgresql://postgres:postgres@localhost:54322/postgres
- **Inbucket (Email)**: http://localhost:54324

### Configuration

Local development configuration is in `supabase/config.toml`. This includes:
- Auth settings (OAuth providers, email templates)
- Database settings
- API settings
- Storage settings

### Seeding Data

Seed data is automatically loaded from `supabase/seed.sql` when running locally.

To reset and reseed:
```bash
supabase db reset
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `businesses` | Business accounts (tenants) |
| `customers` | Customer CRM records |
| `quotes` | Quote/estimate records |
| `messages` | SMS/email messages |
| `sequences` | Follow-up automation sequences |
| `sequence_steps` | Individual steps in sequences |
| `payment_links` | Payment link records |
| `campaigns` | Marketing campaign records |
| `activity_logs` | Activity tracking |

### Generating Types

When you change the schema, regenerate TypeScript types:

```bash
# Using Supabase CLI
supabase gen types typescript --project-id your-project-ref > src/integrations/supabase/types.ts

# Or with local development
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Authentication

### Supported Auth Methods

- **Email/Password**: Traditional signup and login
- **Google OAuth**: Sign in with Google
- **Magic Links**: Passwordless email login

### Auth Configuration

Configure auth in `supabase/config.toml`:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/auth/callback"]

[auth.email]
enable_signup = true
enable_confirmations = true

[auth.external.google]
enabled = true
client_id = "env(GOOGLE_CLIENT_ID)"
secret = "env(GOOGLE_CLIENT_SECRET)"
```

### Using Auth in Components

```tsx
import { useAuth } from '@/providers'

function MyComponent() {
  const { user, session, signIn, signOut, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  if (!user) {
    return <button onClick={() => signIn('email', 'password')}>Sign In</button>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

## Row Level Security (RLS)

All tables have RLS enabled. Policies ensure users can only access their own data.

### Policy Pattern

```sql
-- Users can only access data for their business
CREATE POLICY "Users can access own data"
  ON table_name
  FOR ALL
  USING (business_id IN (
    SELECT id FROM businesses WHERE user_id = auth.uid()
  ));
```

### Bypassing RLS (Server-side only)

Use the admin client for server-side operations that need to bypass RLS:

```typescript
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// This client bypasses RLS - only use server-side!
const supabaseAdmin = getSupabaseAdmin()
```

## Real-time Subscriptions

Real-time is enabled for key tables (`quotes`, `messages`, `customers`).

### Using Real-time

```typescript
import { supabase } from '@/integrations/supabase/client'

// Subscribe to changes
const channel = supabase
  .channel('my-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'quotes',
      filter: `business_id=eq.${businessId}`,
    },
    (payload) => {
      console.log('Change received:', payload)
    }
  )
  .subscribe()

// Clean up
return () => {
  supabase.removeChannel(channel)
}
```

## Utilities

### Connection Status

Monitor connection status:

```tsx
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection'

function StatusIndicator() {
  const { connection, isConfigured, statusMessage } = useSupabaseConnection()
  
  return (
    <div>
      Status: {connection.status}
      {connection.latency && ` (${connection.latency}ms)`}
    </div>
  )
}
```

Or use the pre-built component:

```tsx
import { SupabaseStatus } from '@/components/ui/supabase-status'

<SupabaseStatus detailed />
```

### Query Helpers

```typescript
import { safeQuery, withBusinessId } from '@/lib/supabase/utils'

// Safe query with error handling
const { data, error } = await safeQuery(() =>
  supabase.from('customers').select('*').eq('business_id', businessId)
)

// Add business_id to data
const customerData = withBusinessId(businessId, {
  name: 'John Doe',
  email: 'john@example.com',
})
```

## Troubleshooting

### "Supabase is not configured"

Check that your `.env.local` file exists and contains valid credentials.

### "Invalid JWT" or "JWT expired"

The user's session has expired. Redirect to login or call `supabase.auth.refreshSession()`.

### "new row violates row-level security policy"

The user doesn't have permission for this operation. Check:
1. The user is authenticated
2. The business_id matches the user's business
3. RLS policies are correctly defined

### Real-time not working

1. Check that the table is added to the publication:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE table_name;
   ```
2. Check that RLS policies allow SELECT for the user

### Local development issues

```bash
# Reset local database
supabase db reset

# Check status
supabase status

# View logs
supabase db logs
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
