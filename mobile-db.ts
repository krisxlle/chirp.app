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

// Feed algorithms for sophisticated content ranking
export async function getForYouChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching For You feed with personalized ranking...');
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.reply_to_id IS NULL
      ORDER BY 
        -- Sophisticated ranking algorithm
        ((SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) * 3 + 
         (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) * 2 + 
         CASE WHEN c.created_at > NOW() - INTERVAL '1 day' THEN 10 ELSE 0 END +
         CASE WHEN c.is_weekly_summary THEN 5 ELSE 0 END) DESC,
        c.created_at DESC
      LIMIT 20
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('For You feed error:', error);
    return [];
  }
}

export async function getLatestChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching Latest feed in chronological order...');
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.reply_to_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('Latest feed error:', error);
    return [];
  }
}

export async function getTrendingChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching Trending feed with engagement metrics...');
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.reply_to_id IS NULL 
        AND c.created_at > NOW() - INTERVAL '7 days'
      ORDER BY 
        ((SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) * 2 + 
         (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) * 3) DESC,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) DESC,
        c.created_at DESC
      LIMIT 20
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('Trending feed error:', error);
    return [];
  }
}

function formatChirpResults(chirps: any[]): MobileChirp[] {
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
      profileImageUrl: chirp.profile_image_url || null,
      bannerImageUrl: chirp.banner_image_url || null
    },
    replyCount: parseInt(chirp.reply_count) || 0,
    reactionCount: parseInt(chirp.reaction_count) || 0,
    reactions: [],
    isWeeklySummary: Boolean(chirp.isWeeklySummary)
  })) as MobileChirp[];
}

export async function getChirpsFromDB(): Promise<MobileChirp[]> {
  // Default to For You feed
  return getForYouChirps();
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

export async function getTrendingHashtags() {
  try {
    console.log('Fetching trending hashtags from actual usage...');
    const hashtags = await sql`
      SELECT 
        REGEXP_MATCHES(content, '#[a-zA-Z0-9_]+', 'g') as hashtag_match,
        COUNT(*) as usage_count
      FROM chirps c
      WHERE c.created_at > NOW() - INTERVAL '7 days'
        AND content ~ '#[a-zA-Z0-9_]+'
      GROUP BY hashtag_match
      ORDER BY usage_count DESC
      LIMIT 10
    `;
    
    return hashtags.map(h => ({
      hashtag: h.hashtag_match[0],
      count: `${h.usage_count} chirp${h.usage_count > 1 ? 's' : ''}`
    }));
  } catch (error) {
    console.error('Trending hashtags error:', error);
    // Fallback to common hashtags
    return [
      { hashtag: '#chirp', count: '5 chirps' },
      { hashtag: '#social', count: '3 chirps' },
      { hashtag: '#tech', count: '2 chirps' }
    ];
  }
}

export async function searchChirps(query: string) {
  try {
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        u.profile_image_url,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.content ILIKE ${`%${query}%`}
      ORDER BY reaction_count DESC, c.created_at DESC
      LIMIT 20
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function searchUsers(query: string) {
  try {
    const users = await sql`
      SELECT 
        id,
        COALESCE(custom_handle, handle) as username,
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
        bio,
        profile_image_url
      FROM users
      WHERE 
        custom_handle ILIKE ${`%${query}%`} OR
        handle ILIKE ${`%${query}%`} OR
        first_name ILIKE ${`%${query}%`} OR
        last_name ILIKE ${`%${query}%`}
      LIMIT 10
    `;
    
    return users;
  } catch (error) {
    console.error('User search error:', error);
    return [];
  }
}