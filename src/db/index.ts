import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

function isNeonUrl(url: string): boolean {
  return url.includes('.neon.tech') || url.includes('neondb');
}

function createDb() {
  const connectionString = process.env.DATABASE_URL!;
  const logger = process.env.NODE_ENV === 'development';

  if (isNeonUrl(connectionString)) {
    // Production: Neon serverless driver
    neonConfig.fetchConnectionCache = true;
    return drizzleNeon(new NeonPool({ connectionString }), { schema, logger });
  }

  // Local/CI: Standard node-postgres driver
  return drizzlePg(new PgPool({ connectionString }), { schema, logger });
}

// Create Drizzle instance with schema
export const db = createDb();

// Export types for convenience
export type Database = typeof db;
