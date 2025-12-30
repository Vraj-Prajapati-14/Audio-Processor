# Quick Setup Instructions

## 1. Install Dependencies

```bash
cd audio-processor
npm install
```

## 2. Create Environment File

Create a file named `.env.local` in the `audio-processor` directory with the following content:

```env
# Database (use SQLite for quick testing, or PostgreSQL for production)
# For SQLite (quick start):
DATABASE_URL="file:./dev.db"

# For PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/audiofx_pro?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Google OAuth (Optional - can leave empty for now)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe (Optional - can leave empty for now, but required for subscriptions)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Stripe Price IDs (Required only if using subscriptions)
STRIPE_PRO_MONTHLY_PRICE_ID=""
STRIPE_PRO_QUARTERLY_PRICE_ID=""
STRIPE_PRO_YEARLY_PRICE_ID=""
STRIPE_PREMIUM_MONTHLY_PRICE_ID=""
STRIPE_PREMIUM_QUARTERLY_PRICE_ID=""
STRIPE_PREMIUM_YEARLY_PRICE_ID=""
```

## 3. Generate Prisma Client and Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

## 4. Generate NextAuth Secret (Optional but Recommended)

On Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

Or use any online base64 generator.

## 5. Run the Development Server

```bash
npm run dev
```

## Important Notes

- The app will work with minimal setup (just DATABASE_URL and NEXTAUTH_SECRET)
- Subscription features require Stripe configuration
- Google OAuth is optional
- For production, use PostgreSQL instead of SQLite

## Troubleshooting

If you see "Module not found" errors:
1. Make sure you've run `npm install`
2. Make sure you're in the `audio-processor` directory
3. Delete `node_modules` and `package-lock.json`, then run `npm install` again

If you see NextAuth errors:
1. Make sure `.env.local` exists with at least `NEXTAUTH_SECRET` and `DATABASE_URL`
2. Make sure the database is set up (run `npx prisma migrate dev`)
3. Check that Prisma Client is generated (`npx prisma generate`)

