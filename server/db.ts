import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../shared/schema";

// Supabase configuration
const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'chirp-server',
    },
  },
  db: {
    schema: 'public',
  },
});

// Create postgres connection for Drizzle
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.qrzbtituxxilnbgocdge:ChirpApp2025@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

if (!DATABASE_URL || DATABASE_URL.includes('dummy')) {
  console.warn('⚠️  No DATABASE_URL provided. Running in development mode with mock data.');
  console.warn('   Set DATABASE_URL environment variable to connect to a real database.');
}

// Create postgres client for Drizzle
const postgresClient = postgres(DATABASE_URL);
export const db = drizzle(postgresClient, { schema });

// Export a flag to indicate if we're in development mode
export const isDevelopmentMode = !process.env.DATABASE_URL || DATABASE_URL.includes('dummy');

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}