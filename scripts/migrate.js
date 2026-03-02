#!/usr/bin/env node

/**
 * Prisma migration handler - attempts to apply migrations and handles failures gracefully
 */

const { execSync } = require('child_process');

try {
  console.log('📊 Attempting to apply pending migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations applied successfully');
} catch (error) {
  // Check if error is related to failed migrations
  const errorOutput = error.toString();
  if (errorOutput.includes('P3009') || errorOutput.includes('failed migrations')) {
    console.warn('⚠️ Previous migration failed in database. Attempting to resolve...');
    try {
      // List migrations to find the failed one
      execSync('npx prisma migrate status', { stdio: 'inherit' });
      console.error('❌ Failed migration detected. Please resolve manually in your database.');
      console.error('Run: npx prisma migrate resolve --rolled-back <migration-name>');
      process.exit(1);
    } catch (statusError) {
      console.error('❌ Could not determine migration status:', statusError.message);
      process.exit(1);
    }
  } else {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}
