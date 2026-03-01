# Schema Configuration Guide

This project supports flexible database configuration:

## Local Development (SQLite)
- Uses SQLite for zero-setup local development
- Database file: `prisma/dev.db`
- Automatically configured when `NODE_ENV !== 'production'`

## Production (PostgreSQL)
- Uses PostgreSQL for Vercel and production deployments
- Database credentials should be set via environment variables
- Automatically configured when `NODE_ENV === 'production'`

## How It Works

The `scripts/setup-schema.js` script automatically switches between two schema files:

- **Development**: `prisma/schema.dev.prisma` (SQLite)
- **Production**: `prisma/schema.prod.prisma` (PostgreSQL)

This script runs automatically before:
- `npm run dev`
- `npm run build`
- `npm install` (postinstall)

## Setup Steps

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Run migrations (creates database)
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

### 3. Start development server
\`\`\`bash
npm run dev
\`\`\`

## For Vercel Deployment

1. Add `DATABASE_URL` environment variable in Vercel project settings
   - Use your PostgreSQL provider (Vercel Postgres, Neon, Supabase, etc.)
   - Example: `postgresql://user:password@host:5432/dbname`

2. Deploy normally:
   \`\`\`bash
   git push
   \`\`\`

The postinstall script will automatically:
- Switch to PostgreSQL schema
- Generate Prisma client
- Run migrations

## Manual Schema Usage

If needed, you can manually switch schemas:

\`\`\`bash
# Switch to development (SQLite)
NODE_ENV=development npm run setup-schema

# Switch to production (PostgreSQL)
NODE_ENV=production npm run setup-schema
\`\`\`

## Useful Commands

\`\`\`bash
# View database studio (works with current schema)
npx prisma studio

# Check current schema
cat prisma/schema.prisma | grep "provider ="

# Reset local database
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name your_migration_name
\`\`\`

## Notes

- The main `prisma/schema.prisma` is auto-generated from dev or prod templates
- Never manually edit `prisma/schema.prisma` - edit `.dev.prisma` or `.prod.prisma` instead
- Both schemas have identical models - only the datasource provider differs
- SQLite file location: `prisma/dev.db`
