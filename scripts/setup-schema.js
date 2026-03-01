#!/usr/bin/env node

/**
 * Schema switcher - uses SQLite for development, PostgreSQL for production
 */

const fs = require('fs');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';
const schemaDir = path.join(__dirname, '..', 'prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');
const devSchema = path.join(schemaDir, 'schema.dev.prisma');
const prodSchema = path.join(schemaDir, 'schema.prod.prisma');

const sourceSchema = isDevelopment ? devSchema : prodSchema;

console.log(`📊 Setting up ${isDevelopment ? 'SQLite (development)' : 'PostgreSQL (production)'} schema...`);

try {
  fs.copyFileSync(sourceSchema, mainSchema);
  console.log(`✅ Schema switched to ${isDevelopment ? 'SQLite' : 'PostgreSQL'}`);
} catch (error) {
  console.error('❌ Error switching schema:', error.message);
  process.exit(1);
}
