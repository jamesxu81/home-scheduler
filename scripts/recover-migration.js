#!/usr/bin/env node

/**
 * Migration Recovery Script
 * 
 * This script helps resolve failed migrations in the production database.
 * The migration 20260303000000_add_recurring_fields failed and is blocking future migrations.
 * 
 * IMPORTANT: This should only be run if you have direct database access or Vercel support assistance.
 */

const { execSync } = require('child_process');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable not set');
  console.error('Please set DATABASE_URL to your production database connection string');
  process.exit(1);
}

console.log('📊 Migration Recovery Tool');
console.log('================================================');
console.log('');
console.log('ISSUE: The migration "20260303000000_add_recurring_fields" failed');
console.log('This is blocking all future migrations.');
console.log('');
console.log('SOLUTION OPTIONS:');
console.log('');
console.log('Option 1: Mark migration as rolled back (if it was never actually applied)');
console.log('  Command: npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
console.log('');
console.log('Option 2: Mark migration as applied (if columns now exist in database)');
console.log('  Command: npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
console.log('');
console.log('Option 3: Check migration status first');
console.log('  Command: npx prisma migrate status');
console.log('');
console.log('================================================');
console.log('');
console.log('DATABASE_URL is set. You can now run one of the commands above.');
console.log('');
console.log('RECOMMENDED:');
console.log('1. Run: npx prisma migrate status');
console.log('2. Check if the columns (repeatType, repeatUntil) exist in the Event table');
console.log('3. If they exist, run: npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
console.log('4. If they don\'t exist, run: npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
console.log('5. Then manually apply: npx prisma migrate deploy');
console.log('');
