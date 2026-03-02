#!/usr/bin/env node

/**
 * Safe Migration Deploy Script
 * 
 * Implements Prisma's recommended failed migration recovery workflow:
 * https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#failed-migration
 * 
 * Handles two scenarios:
 * 1. Columns don't exist (P3009) - mark as rolled back, then deploy
 * 2. Columns already exist (P3018, column already exists) - mark as applied
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
  
  // Check for P3009 - failed migrations error (migration is in failed state)
  if (errorStr.includes('P3009') || errorStr.includes('failed migrations')) {
    console.warn('');
    console.warn('⚠️  FAILED MIGRATION DETECTED: 20260303000000_add_recurring_fields');
    console.warn('Migration is in failed state (not yet applied)');
    console.warn('================================================');
    console.warn('');
    
    if (isProduction) {
      console.log('Step 1: Marking failed migration as rolled back...');
      try {
        execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { 
          stdio: 'inherit' 
        });
        console.log('✅ Failed migration marked as rolled back');
      } catch (resolveError) {
        console.error('❌ Could not resolve migration:', resolveError.message);
        process.exit(1);
      }
      
      console.log('');
      console.log('Step 2: Deploying migrations...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('');
        console.log('✅ Migrations applied successfully with recovery workflow');
      } catch (deployError) {
        console.error('❌ Migration deployment failed:', deployError.message);
        process.exit(1);
      }
    } else {
      // For development, auto-recover
      try {
        console.log('Auto-resolving failed migration for development...');
        execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { 
          stdio: 'inherit' 
        });
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations applied successfully');
      } catch (recoveryError) {
        console.error('❌ Auto-recovery failed:', recoveryError.message);
        process.exit(1);
      }
    }
  } 
  // Check for P3018 - columns already exist (partial execution)
  else if (errorStr.includes('P3018') || errorStr.includes('already exists')) {
    console.warn('');
    console.warn('⚠️  MIGRATION PARTIALLY APPLIED: 20260303000000_add_recurring_fields');
    console.warn('Columns already exist in database from previous partial execution');
    console.warn('================================================');
    console.warn('');
    
    console.log('Step 1: Marking migration as already applied...');
    try {
      execSync('npx prisma migrate resolve --applied 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration marked as applied');
    } catch (resolveError) {
      console.error('❌ Could not resolve migration:', resolveError.message);
      process.exit(1);
    }
    
    console.log('');
    console.log('Step 2: Attempting to deploy remaining migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('');
      console.log('✅ Migrations applied successfully after marking as applied');
    } catch (deployError) {
      // Check if there are no more migrations to deploy
      if (deployError.toString().includes('database schema is already in sync')) {
        console.log('');
        console.log('✅ Database schema is already in sync');
      } else {
        console.error('❌ Deployment still failing:', deployError.message);
        process.exit(1);
      }
    }
  }
  else {
    console.error('❌ Migration failed with error:', error.message);
    process.exit(1);
  }
}
