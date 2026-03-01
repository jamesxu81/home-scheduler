#!/usr/bin/env node

/**
 * Schema switcher - uses SQLite for development, PostgreSQL for production
 * Intelligently detects environment based on NODE_ENV and DATABASE_URL
 */

const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');
const devSchema = path.join(schemaDir, 'schema.dev.prisma');
const prodSchema = path.join(schemaDir, 'schema.prod.prisma');

// Detect environment based on NODE_ENV and DATABASE_URL
const nodeEnv = process.env.NODE_ENV || 'development';
const databaseUrl = process.env.DATABASE_URL || '';

// If DATABASE_URL is set and looks like PostgreSQL, use production schema
// Otherwise, check NODE_ENV
const isPostgresUrl = databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://');
const isDevelopment = !isPostgresUrl && nodeEnv !== 'production';

const sourceSchema = isDevelopment ? devSchema : prodSchema;
const dbType = isDevelopment ? 'SQLite (development)' : 'PostgreSQL (production)';

console.log(`📊 NODE_ENV=${nodeEnv}, DATABASE_URL=${databaseUrl ? databaseUrl.substring(0, 30) + '...' : 'not set'}`);
console.log(`📊 Setting up ${dbType} schema...`);

try {
  fs.copyFileSync(sourceSchema, mainSchema);
  console.log(`✅ Schema switched to ${dbType}`);
} catch (error) {
  console.error('❌ Error switching schema:', error.message);
  process.exit(1);
}
