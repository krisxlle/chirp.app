import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use a fallback database URL for development if none is provided
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

if (!DATABASE_URL || DATABASE_URL.includes('dummy')) {
  console.warn('⚠️  No DATABASE_URL provided. Running in development mode with mock data.');
  console.warn('   Set DATABASE_URL environment variable to connect to a real database.');
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Export a flag to indicate if we're in development mode
export const isDevelopmentMode = !process.env.DATABASE_URL || DATABASE_URL.includes('dummy');