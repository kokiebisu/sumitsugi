import * as schema from './schema';

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

function isNeonUrl(url: string): boolean {
  return url.includes('.neon.tech') || url.includes('neondb');
}

// Prevent bundler static analysis of conditional requires
// eslint-disable-next-line @typescript-eslint/no-require-imports
const loadModule = (name: string) => require(name);

function createDb() {
  const connectionString = process.env.DATABASE_URL!;
  const logger = process.env.NODE_ENV === 'development';

  if (isNeonUrl(connectionString)) {
    // Production: Neon serverless driver
    const { Pool, neonConfig } = loadModule(
      '@neondatabase/serverless'
    ) as typeof import('@neondatabase/serverless');
    const { drizzle } = loadModule(
      'drizzle-orm/neon-serverless'
    ) as typeof import('drizzle-orm/neon-serverless');
    neonConfig.fetchConnectionCache = true;
    return drizzle(new Pool({ connectionString }), { schema, logger });
  }

  // Local/CI: Standard node-postgres driver
  const { Pool } = loadModule('pg') as typeof import('pg');
  const { drizzle } = loadModule(
    'drizzle-orm/node-postgres'
  ) as typeof import('drizzle-orm/node-postgres');
  return drizzle(new Pool({ connectionString }), { schema, logger });
}

// Create Drizzle instance with schema
export const db = createDb();

// Export types for convenience
export type Database = typeof db;
