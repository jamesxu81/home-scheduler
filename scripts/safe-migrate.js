#!/usr/bin/env node

/**
 * Safe Migration Deploy Script
 * 
 * Implements Prisma's recommended failed migration recovery workflow:
 * https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#failed-migration
 * 
 * For failed migrations:
 * 1. Mark failed migration as rolled back
 * 2. Deploy migrations again (fixing the partial execution)
 */

const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL || '';
const isProduction = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log('📊 Running Prisma migrations...');
console.log(`Environment: ${isProduction ? 'Production (PostgreSQL)' : 'Development (SQLite)'}`);
console.log('');

try {
  // Try to apply migrations normally
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations applied successfully');
} catch (error) {
  const errorStr = error.toString();
  
  // Check for P3009 - failed migrations error (Prisma's recommended recovery)
  if (errorStr.includes('P3009') || errorStr.includes('failed migrations')) {
    console.warn('');
    console.warn('⚠️  FAILED MIGRATION DETECTED: 20260303000000_add_recurring_fields');
    console.warn('================================================');
    console.warn('');
    console.warn('Implementing Prisma recovery workflow...');
    console.warn('Reference: https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing');
    console.warn('');
    
    // Step 1: Mark the failed migration as rolled back
    console.warn('Step 1: Marking failed migration as rolled back...');
    try {
      execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Failed migration marked as rolled back');
    } catch (resolveError) {
      console.warn('ℹ️  Migration status: Not in a failed state or already resolved');
    }
    
    // Step 2: Deploy all migrations again
    console.log('');
    console.log('Step 2: Deploying migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('');
      console.log('✅ Migrations applied successfully with recovery workflow');
    } catch (deployError) {
      const deployErrorStr = deployError.toString();
      
      if (isProduction) {
        console.error('');
        console.error('❌ PRODUCTION DATABASE - MANUAL INTERVENTION REQUIRED');
        console.error('');
        console.error('The columns (repeatType, repeatUntil, duration) may already exist');
        console.error('in your Event table from the partial failure.');
        console.error('');
        console.error('Manually check your database and run one of these:');
        console.error('');
        console.error('1. If columns were partially created, mark as applied:');
        console.error('   npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
        console.error('');
        console.error('2. If columns do NOT exist, mark as rolled back (already done):');
        console.error('   npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
        console.error('');
        console.error('Then try deploying again:');
        console.error('   npx prisma migrate deploy');
        console.error('');
        process.exit(1);
      } else {
        // For development, provide helpful information
        console.error('❌ Migration deployment still failing');
        console.error('');
        console.error('This might happen if columns already exist from partial execution.');
        console.error('Solution for development:');
        console.error('1. Check what columns exist: sqlite3 ./prisma/dev.db ".schema Event"');
        console.error('2. If columns exist, mark migration as applied:');
        console.error('   npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
        console.error('');
        process.exit(1);
      }
    }
  } else {
    console.error('❌ Migration failed with error:', error.message);
    process.exit(1);
  }
}
