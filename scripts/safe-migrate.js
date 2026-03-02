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
  // Try to apply migrations normally, capturing output
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations applied successfully');
} catch (error) {
  // Capture full error including stdout and stderr
  let errorOutput = '';
  try {
    errorOutput = execSync('npx prisma migrate status', { encoding: 'utf-8' });
  } catch (statusError) {
    errorOutput = statusError.stdout || statusError.stderr || error.toString();
  }
  
  const fullErrorStr = (error.stdout || '') + (error.stderr || '') + error.toString() + errorOutput;
  
  console.log('');
  console.log('Error details:', fullErrorStr);
  console.log('');
  
  // Check for P3018 - columns already exist (partial execution)
  if (fullErrorStr.includes('P3018') || fullErrorStr.includes('already exists') || fullErrorStr.includes('column') && fullErrorStr.includes('does not exist')) {
    console.warn('⚠️  MIGRATION STATE ERROR DETECTED');
    console.warn('================================================');
    console.warn('');
    
    // Check if it's a "column already exists" error
    if (fullErrorStr.includes('already exists')) {
      console.warn('Columns were partially created from previous execution');
      console.warn('Marking migration as --applied...');
    } else {
      console.warn('Migration is in a failed state');
      console.warn('Attempting to recover...');
    }
    console.warn('');
    
    // Try to mark as applied first
    try {
      console.log('Attempting to mark migration as applied...');
      execSync('npx prisma migrate resolve --applied 20260303000000_add_recurring_fields', { 
        stdio: 'inherit' 
      });
      console.log('✅ Migration marked as applied');
      
      // Now try to deploy
      console.log('');
      console.log('Attempting to deploy remaining migrations...');
      try {
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations applied successfully');
      } catch (deployError) {
        const statusOutput = execSync('npx prisma migrate status', { encoding: 'utf-8' }).toString();
        if (statusOutput.includes('up to date') || statusOutput.includes('in sync')) {
          console.log('✅ Database schema is already in sync');
        } else {
          throw deployError;
        }
      }
    } catch (resolveAppliedError) {
      // If marking as applied fails, try marking as rolled back
      console.warn('');
      console.warn('Marking as applied failed, trying to roll back...');
      try {
        execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { 
          stdio: 'inherit' 
        });
        console.log('✅ Migration marked as rolled back');
        
        console.log('');
        console.log('Deploying migrations...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations applied successfully');
      } catch (retryError) {
        console.error('❌ Migration recovery failed');
        console.error('');
        console.error('Please manually resolve the migration:');
        console.error('  1. Check your database: Does the Event table have repeatType column?');
        console.error('  2. If YES: npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
        console.error('  3. If NO: npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
        console.error('  4. Then: npx prisma migrate deploy');
        process.exit(1);
      }
    }
  } 
  // Check for P3009 - migration not yet applied
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
