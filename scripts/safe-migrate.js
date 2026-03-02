#!/usr/bin/env node

/**
 * Safe Migration Deploy Script
 * 
 * This script attempts to apply migrations and gracefully handles known failures.
 * It checks for the specific P3009 error (failed migrations) and provides recovery options.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const databaseUrl = process.env.DATABASE_URL || '';
const isProduction = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');

console.log('📊 Running Prisma migrations...');
console.log(`Environment: ${isProduction ? 'Production (PostgreSQL)' : 'Development (SQLite)'}`);
console.log('');

try {
  // Try to apply migrations
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrations applied successfully');
} catch (error) {
  const errorOutput = error.status ? `Exit code ${error.status}` : error.message;
  const errorStr = error.toString();
  
  // Check for P3009 - failed migrations error
  if (errorStr.includes('P3009') || errorStr.includes('failed migrations')) {
    console.warn('');
    console.warn('⚠️  FAILED MIGRATION DETECTED');
    console.warn('================================================');
    console.warn('');
    console.warn('The migration "20260303000000_add_recurring_fields" has failed.');
    console.warn('');
    
    if (isProduction) {
      console.warn('🔧 PRODUCTION DATABASE - MANUAL RESOLUTION REQUIRED');
      console.warn('');
      console.warn('Please run one of these commands:');
      console.warn('');
      console.warn('1. If the columns already exist in the database:');
      console.warn('   DATABASE_URL="your_url" npx prisma migrate resolve --applied 20260303000000_add_recurring_fields');
      console.warn('');
      console.warn('2. If the columns do NOT exist in the database:');
      console.warn('   DATABASE_URL="your_url" npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
      console.warn('');
      console.warn('After resolution, run:');
      console.warn('   DATABASE_URL="your_url" npx prisma migrate deploy');
      console.warn('');
      console.warn('Contact Vercel support or your database provider for assistance.');
      process.exit(1);
    } else {
      console.warn('🔧 DEVELOPMENT DATABASE - ATTEMPTING AUTO-RECOVERY');
      console.warn('');
      
      // For development, try to resolve automatically
      try {
        console.warn('Resolving failed migration...');
        execSync('npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields', { stdio: 'inherit' });
        console.warn('');
        console.warn('Retrying migration deployment...');
        execSync('npx prisma migrate deploy', { stdio: 'inherit' });
        console.log('✅ Migrations applied successfully after recovery');
      } catch (recoveryError) {
        console.error('❌ Auto-recovery failed:', recoveryError.message);
        console.error('Please manually resolve the migration:');
        console.error('  npx prisma migrate resolve --rolled-back 20260303000000_add_recurring_fields');
        process.exit(1);
      }
    }
  } else {
    console.error('❌ Migration failed with error:', errorOutput);
    process.exit(1);
  }
}
