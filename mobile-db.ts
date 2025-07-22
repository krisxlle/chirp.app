// Direct database connection for mobile app to access authentic user data
import { neon } from '@neondatabase/serverless';
import type { Chirp } from './shared/schema';

const sql = neon(process.env.DATABASE_URL!);

export async function getChirpsFromDB(): Promise<Chirp[]> {
  try {
    console.log('Fetching authentic chirps from database...');
    const chirps = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at as "createdAt",
        u.custom_handle as username,
        u.display_name,
        c.is_weekly_summary as "isWeeklySummary"
      FROM chirps c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    
    console.log(`Successfully loaded ${chirps.length} authentic chirps`);
    return chirps as Chirp[];
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function getUserFromDB() {
  try {
    console.log('Fetching authenticated user data...');
    const users = await sql`
      SELECT 
        id,
        custom_handle,
        display_name,
        bio,
        avatar_url,
        banner_url,
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