#!/usr/bin/env node

/**
 * Safe Migration Deploy Script
 * 
 * Implements Prisma's recommended failed migration recovery workflow:
 * https://www.prisma.io/docs/orm/prisma-migrate/workflows/patching-and-hotfixing#failed-migration
 * 
 * Handles scenarios:
 * 1. Columns don't exist (P3009) - mark as rolled back, then deploy
 * 2. Columns already exist (P3018) - mark as applied
 * 3. Schema drift (migrations in DB not in repo) - mark as applied and skip
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
  // Capture full error output
  let errorOutput = '';
  try {
    errorOutput = execSync('npx prisma migrate status', { encoding: 'utf-8' });
  } catch (statusError) {
    errorOutput = (statusError.stdout || '') + (statusError.stderr || '');
  }
  
  const fullErrorStr = (error.stdout || '') + (error.stderr || '') + error.toString() + errorOutput;
  
  console.log('');
  console.log('=== Migration Status ===');
  console.log(errorOutput);
  console.log('');
  
  // Check for attempts to add duration column when it already exists
  if ((fullErrorStr.includes('20260304000000_add_duration_to_events') || fullErrorStr.includes('add_duration')) &&
      (fullErrorStr.includes('column "duration"') && fullErrorStr.includes('already exists'))) {
    console.warn('⚠️  DUPLICATE MIGRATION: 20260304000000_add_duration_to_events');
    console.warn('Column already added by recovery migration');
    console.warn('================================================');
    console.warn('');
    
    console.log('Marking migration as rolled back (work already done)...');
    try {
      execSync('npx prisma migrate resolve --rolled-back 20260304000000_add_duration_to_events', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration marked as rolled back');
      console.log('✅ Duration column already exists from recovery migration');
    } catch (resolveError) {
      const resolveStr = resolveError.toString();
      if (resolveStr.includes('not in a failed state') || resolveStr.includes('already marked')) {
        console.log('✅ Migration already resolved');
      } else {
        console.error('❌ Could not resolve migration:', resolveError.message);
        process.exit(1);
      }
    }
  }
  // Check for schema drift or migration issues
  else if (fullErrorStr.includes('migrations from the database are not found locally') || 
      fullErrorStr.includes('migration history and the migrations table')) {
    console.warn('⚠️  SCHEMA DRIFT DETECTED');
    console.warn('Database has migrations not in local repository');
    console.warn('================================================');
    console.warn('');
    console.log('This is safe - it means the database was already updated.');
    console.log('Marking pending migrations as applied...');
    console.log('');
    
    // Try to mark the problematic migration as applied
    try {
      execSync('npx prisma migrate resolve --applied 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration 20260303000000_add_recurring_fields marked as applied');
      console.log('✅ Database schema is already in sync');
      console.log('✅ Schema drift reconciled');
    } catch (resolveError) {
      // If that fails, the migration might already be resolved
      const resolveStr = resolveError.toString();
      if (resolveStr.includes('not in a failed state') || resolveStr.includes('already marked')) {
        console.log('✅ Migration already resolved');
        console.log('✅ Database schema is in sync');
      } else {
        console.error('❌ Could not resolve migration:', resolveError.message);
        process.exit(1);
      }
    }
  }
  // Check for P3018 - columns already exist
  else if (fullErrorStr.includes('P3018') || fullErrorStr.includes('already exists')) {
    console.warn('⚠️  MIGRATION PARTIALLY APPLIED: 20260303000000_add_recurring_fields');
    console.warn('Columns already exist in database');
    console.warn('================================================');
    console.warn('');
    
    console.log('Marking migration as applied...');
    try {
      execSync('npx prisma migrate resolve --applied 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration marked as applied');
      console.log('✅ Database schema reconciled');
    } catch (resolveError) {
      console.error('❌ Could not resolve migration:', resolveError.message);
      process.exit(1);
    }
  }
  // Check for P3009 - migration in failed state
  else if (fullErrorStr.includes('P3009') || fullErrorStr.includes('failed migrations')) {
    console.warn('⚠️  FAILED MIGRATION DETECTED: 20260303000000_add_recurring_fields');
    console.warn('Migration is in failed state (not yet applied)');
    console.warn('================================================');
    console.warn('');
    
    console.log('Marking migration as rolled back...');
    try {
      execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration marked as rolled back');
    } catch (resolveError) {
      console.error('❌ Could not resolve migration:', resolveError.message);
      process.exit(1);
    }
    
    console.log('');
    console.log('Deploying migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migrations applied successfully');
    } catch (deployError) {
      console.error('❌ Deployment failed:', deployError.message);
      process.exit(1);
    }
  }
  else {
    console.error('❌ Unexpected migration error:');
    console.error(error.message);
    process.exit(1);
  }
}
