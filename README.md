# Selestial

Quote follow-up automation platform for home service businesses. Convert more quotes to jobs with AI-powered SMS/email sequences, smart payment links, and customer relationship management.

## Features

- **Quote Management**: Track quotes, win rates, and conversion metrics
- **Automated Follow-ups**: AI-powered SMS and email sequences
- **Smart Payments**: Integrated payment links with Stripe Connect
- **Customer CRM**: Manage customer relationships and service history
- **Booking Widget**: Embeddable booking system for cleaning businesses
- **Analytics**: Track performance and optimize your business

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **Components**: Radix UI + shadcn/ui
- **Payments**: Stripe / Stripe Connect
- **SMS**: Twilio
- **Email**: Resend
- **AI**: Anthropic Claude / OpenAI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account (for payments)
- Twilio account (for SMS)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd selestial-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials. See [SUPABASE.md](./SUPABASE.md) for detailed setup instructions.

4. **Set up the database**
   
   Option A: Using Supabase CLI (recommended)
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```
   
   Option B: Manually run migrations in Supabase Dashboard SQL Editor

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Main app dashboard
│   │   ├── api/               # API routes
│   │   ├── book/              # Booking widget
│   │   └── pay/               # Payment pages
│   ├── components/            # React components
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/          # Third-party integrations
│   │   └── supabase/          # Supabase client & types
│   ├── lib/                   # Utility functions
│   │   ├── supabase/          # Supabase utilities
│   │   ├── stripe/            # Stripe utilities
│   │   └── twilio/            # Twilio utilities
│   └── providers/             # React context providers
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── templates/             # Email templates
│   ├── config.toml            # Local dev config
│   └── seed.sql               # Development seed data
└── public/                    # Static assets
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Category | Variables |
|----------|-----------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Stripe** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` |
| **Email** | `RESEND_API_KEY` |
| **AI** | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` |

See [.env.example](./.env.example) for the complete list.

## Documentation

- [Supabase Integration Guide](./SUPABASE.md) - Database setup and configuration
- [Stripe Setup](#) - Payment integration (coming soon)
- [Twilio Setup](#) - SMS integration (coming soon)

## Local Development with Supabase

For local development, you can run a local Supabase instance:

```bash
# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Open Supabase Studio
# http://localhost:54323

# Stop when done
supabase stop
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Multi-Domain Architecture

The app supports multiple subdomains:

| Domain | Purpose |
|--------|---------|
| `app.selestial.io` | Main SaaS application (auth required) |
| `docs.selestial.io` | Documentation |
| `book.selestial.io` | Customer booking widget |
| `paylink.selestial.io` | Payment link pages |

## Deployment

The app is designed to deploy on Vercel:

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

## License

Proprietary - All rights reserved.
