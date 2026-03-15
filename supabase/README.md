# Supabase Setup Guide

This project has been migrated from Prisma ORM to Supabase. Follow these steps to set up your Supabase project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Note down your project URL and API keys

## 2. Configure Environment Variables

Update your `.env` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in:
- Supabase Dashboard → Project Settings → API

## 3. Run Database Schema

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/schema.sql` from this project
3. Copy and paste the entire schema into the SQL Editor
4. Click "Run" to create all tables

## 4. Seed the Database

Run the seed script to populate initial data:

```bash
bun run db:seed
```

## 5. Configure Row Level Security (Optional for Production)

The schema includes basic RLS policies that allow all operations. For production, you should:

1. Remove the "Allow all for development" policies
2. Create specific policies based on user roles
3. Use Supabase Auth for authentication

## Database Types

TypeScript types are defined in `src/lib/supabase/database.types.ts`. If you modify the schema, regenerate types using:

```bash
npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/database.types.ts
```

## Architecture

- **Client**: `src/lib/supabase/client.ts` - Browser client
- **Server**: `src/lib/supabase/server.ts` - Server-side clients
- **Database Helper**: `src/lib/db.ts` - Prisma-like API wrapper
- **Types**: `src/lib/supabase/database.types.ts` - TypeScript types

## Migration from Prisma

The `db` helper in `src/lib/db.ts` provides a Prisma-like API for easier migration:

```typescript
// Old Prisma
const participant = await prisma.participant.findFirst({ where: { qrCode } })

// New Supabase (via db helper)
const participant = await db.participant.findFirst({ where: { qrCode } })
```

The API is designed to be familiar, but internally uses Supabase client.
