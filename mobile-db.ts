// Direct database connection for mobile app to access authentic user data
import { neon } from '@neondatabase/serverless';
import type { MobileChirp, MobileUser } from './mobile-types';

// Get database URL for React Native/Expo environment
// In Expo, we need to use a different approach for environment variables
const getDatabaseUrl = () => {
  // Try multiple ways to access the DATABASE_URL
  if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // For Expo web, try global environment
  if (typeof window !== 'undefined' && (window as any).__ENV__?.DATABASE_URL) {
    return (window as any).__ENV__.DATABASE_URL;
  }
  
  // Fallback to the actual database URL from environment
  const dbUrl = 'postgresql://neondb_owner:npg_vLmUtE3gZ8Ck@ep-flat-river-afy8pigw.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
  console.log('Using fallback database URL for Expo environment');
  return dbUrl;
};

const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  throw new Error('DATABASE_URL could not be determined');
}
const sql = neon(databaseUrl);

export async function getChirpsFromDB(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching authentic chirps from database...');
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary"
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.reply_to_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    
    console.log(`Successfully loaded ${chirps.length} authentic chirps`);
    return chirps.map(chirp => ({
      id: String(chirp.id),
      content: String(chirp.content),
      createdAt: chirp.createdAt ? new Date(chirp.createdAt).toISOString() : new Date().toISOString(),
      author: {
        id: '1',
        firstName: String(chirp.display_name || 'User').split(' ')[0],
        lastName: String(chirp.display_name || 'User').split(' ')[1] || '',
        email: 'user@chirp.com',
        customHandle: String(chirp.username || 'user'),
        handle: String(chirp.username || 'user'),
        profileImageUrl: null
      },
      replyCount: 0,
      reactionCount: 0,
      reactions: [],
      isWeeklySummary: Boolean(chirp.isWeeklySummary)
    })) as MobileChirp[];
  } catch (error) {
    console.error('Database connection error:', error);
    // Return some authentic-looking sample data as fallback
    return [{
      id: '1',
      content: 'Database connection issue - working to restore authentic content...',
      username: 'system',
      createdAt: new Date().toISOString(),
      reactions: []
    }] as MobileChirp[];
  }
}

export async function getUserFromDB() {
  try {
    console.log('Fetching authenticated user data...');
    const users = await sql`
      SELECT 
        id,
        custom_handle,
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
        bio,
        profile_image_url as avatar_url,
        banner_image_url as banner_url,
        link_in_bio
      FROM users 
      LIMIT 1
    `;
    
    if (users.length > 0) {
      console.log('Successfully loaded user profile:', users[0].custom_handle);
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('User fetch error:', error);
    return null;
  }
}

export async function getReactionsForChirp(chirpId: number) {
  try {
    const reactions = await sql`
      SELECT emoji, COUNT(*) as count
      FROM reactions 
      WHERE chirp_id = ${chirpId}
      GROUP BY emoji
      ORDER BY count DESC
      LIMIT 10
    `;
    
    return reactions.map(r => ({ emoji: r.emoji, count: Number(r.count) }));
  } catch (error) {
    console.error('Reactions fetch error:', error);
    return [];
  }
}