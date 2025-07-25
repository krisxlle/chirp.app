// Direct database connection for mobile app to access authentic user data
import { neon } from '@neondatabase/serverless';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MobileChirp, MobileUser } from './mobile-types';

// Get database URL for React Native/Expo environment
// In Expo, we need to use a different approach for environment variables
const getDatabaseUrl = () => {
  // For Node.js environment (server-side) 
  if (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) {
    console.log('✅ Using process.env.DATABASE_URL');
    return process.env.DATABASE_URL;
  }
  
  // For Expo web, try global environment
  if (typeof window !== 'undefined' && (window as any).__ENV__?.DATABASE_URL) {
    console.log('✅ Using DATABASE_URL from window.__ENV__');
    return (window as any).__ENV__.DATABASE_URL;
  }
  
  // Final fallback to the actual database URL for Expo environment
  const dbUrl = 'postgresql://neondb_owner:npg_vLmUtE3gZ8Ck@ep-flat-river-afy8pigw.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
  console.log('⚠️ Using hardcoded fallback database URL for Expo environment');
  return dbUrl;
};

let sql: any;

// Initialize database connection with error handling
const initializeDatabase = () => {
  try {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error('DATABASE_URL could not be determined');
    }
    console.log('🔌 Initializing database connection...');
    sql = neon(databaseUrl);
    console.log('✅ Database connection initialized successfully');
    return sql;
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error);
    throw error;
  }
};

// Initialize the connection
sql = initializeDatabase();

// Feed algorithms for sophisticated content ranking
export async function getForYouChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching For You feed with personalized ranking...');
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        c.author_id::text,
        c.repost_of_id,
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        -- Original chirp data for reposts
        oc.id as original_chirp_id,
        oc.content as original_content,
        oc.created_at as original_created_at,
        oc.author_id as original_author_id,
        COALESCE(ou.custom_handle, ou.handle, CAST(ou.id AS text), 'user') as original_username,
        COALESCE(ou.first_name || ' ' || ou.last_name, ou.custom_handle, ou.handle) as original_display_name,
        ou.profile_image_url as original_profile_image_url,
        ou.banner_image_url as original_banner_image_url,
        COALESCE(oc.is_weekly_summary, false) as original_is_weekly_summary,
        -- Counts based on original chirp for reposts, current chirp for regular posts
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = COALESCE(c.repost_of_id, c.id)) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = COALESCE(c.repost_of_id, c.id)) as reply_count,
        (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = COALESCE(c.repost_of_id, c.id)) as repost_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN chirps oc ON c.repost_of_id = oc.id
      LEFT JOIN users ou ON oc.author_id = ou.id
      WHERE c.reply_to_id IS NULL
      ORDER BY 
        -- Sophisticated ranking algorithm
        ((SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = COALESCE(c.repost_of_id, c.id)) * 3 + 
         (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = COALESCE(c.repost_of_id, c.id)) * 2 + 
         CASE WHEN c.created_at > NOW() - INTERVAL '1 day' THEN 10 ELSE 0 END +
         CASE WHEN COALESCE(c.is_weekly_summary, oc.is_weekly_summary) THEN 5 ELSE 0 END) DESC,
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
        c.author_id::text,
        c.repost_of_id,
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        -- Original chirp data for reposts
        oc.id as original_chirp_id,
        oc.content as original_content,
        oc.created_at as original_created_at,
        oc.author_id as original_author_id,
        COALESCE(ou.custom_handle, ou.handle, CAST(ou.id AS text), 'user') as original_username,
        COALESCE(ou.first_name || ' ' || ou.last_name, ou.custom_handle, ou.handle) as original_display_name,
        ou.profile_image_url as original_profile_image_url,
        ou.banner_image_url as original_banner_image_url,
        COALESCE(oc.is_weekly_summary, false) as original_is_weekly_summary,
        -- Counts based on original chirp for reposts, current chirp for regular posts
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = COALESCE(c.repost_of_id, c.id)) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = COALESCE(c.repost_of_id, c.id)) as reply_count,
        (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = COALESCE(c.repost_of_id, c.id)) as repost_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN chirps oc ON c.repost_of_id = oc.id
      LEFT JOIN users ou ON oc.author_id = ou.id
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
        c.author_id::text,
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

// Create a new chirp
export async function createChirp(content: string, authorId?: string, replyToId?: string | null): Promise<MobileChirp | null> {
  try {
    console.log('Creating new chirp in database...');
    
    if (!authorId) {
      throw new Error('Author ID is required to create a chirp');
    }
    
    // Filter out hyperlinks from chirp content (same as backend)
    let filteredContent = content;
    if (filteredContent && typeof filteredContent === 'string') {
      // Remove HTTP/HTTPS URLs
      filteredContent = filteredContent.replace(/https?:\/\/[^\s]+/gi, '[link removed]');
      // Remove www. links
      filteredContent = filteredContent.replace(/www\.[^\s]+/gi, '[link removed]');
      // Remove domain-like patterns (but preserve @mentions)
      filteredContent = filteredContent.replace(/(?<!@)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, '[link removed]');
    }
    
    if (!filteredContent.trim()) {
      throw new Error('Chirp content cannot be empty');
    }
    
    if (filteredContent.length > 280) {
      throw new Error('Chirp content too long');
    }
    
    const result = await sql`
      INSERT INTO chirps (content, author_id, reply_to_id, created_at)
      VALUES (${filteredContent}, ${authorId}, ${replyToId}, NOW())
      RETURNING 
        id::text,
        content,
        created_at as "createdAt",
        author_id
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const newChirp = result[0];
    
    // Get author details
    const authorResult = await sql`
      SELECT 
        id::text,
        COALESCE(custom_handle, handle, CAST(id AS text), 'user') as username,
        COALESCE(first_name, custom_handle, handle) as display_name,
        profile_image_url
      FROM users 
      WHERE id = ${authorId}
    `;
    
    const author = authorResult[0] || {
      id: authorId,
      username: 'user',
      display_name: 'User',
      profile_image_url: null
    };
    
    console.log('Successfully created new chirp:', newChirp.id);
    
    return {
      id: newChirp.id,
      content: newChirp.content,
      createdAt: newChirp.createdAt,
      isWeeklySummary: false,
      author: {
        id: author.id,
        firstName: author.display_name?.split(' ')[0] || author.username || 'User',
        lastName: "",
        email: `${author.username}@chirp.com`,
        handle: author.username,
        customHandle: author.username,
        profileImageUrl: author.profile_image_url,
      },
      replyCount: 0,
      reactionCount: 0,
      reactions: [],
    };
  } catch (error) {
    console.error('Error creating chirp:', error);
    throw error;
  }
}

// Get user by ID for profile viewing
export async function getUserById(userId: string): Promise<any | null> {
  try {
    console.log('Fetching user by ID:', userId);
    const users = await sql`
      SELECT 
        id::text,
        email,
        first_name,
        last_name,
        custom_handle,
        handle,
        profile_image_url,
        banner_image_url,
        bio,
        created_at,
        is_chirp_plus,
        show_chirp_plus_badge,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;
    
    if (users.length > 0) {
      const user = users[0];
      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        custom_handle: user.custom_handle,
        handle: user.handle,
        profile_image_url: user.profile_image_url,
        banner_image_url: user.banner_image_url,
        bio: user.bio,
        created_at: user.created_at,
        is_chirp_plus: user.is_chirp_plus,
        show_chirp_plus_badge: user.show_chirp_plus_badge,
        stripe_customer_id: user.stripe_customer_id,
        stripe_subscription_id: user.stripe_subscription_id
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Get chirps by user ID for profile viewing
export async function getChirpsByUserId(userId: string): Promise<MobileChirp[]> {
  try {
    console.log('Fetching chirps by user ID:', userId);
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        c.reply_to_id::text as "replyToId",
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        u.id::text as author_id,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.author_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 20
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('Error fetching user chirps:', error);
    return [];
  }
}

function formatChirpResults(chirps: any[]): MobileChirp[] {
  console.log(`Successfully loaded ${chirps.length} authentic chirps`);
  return chirps.map(chirp => {
    const isRepost = Boolean(chirp.repost_of_id);
    
    return {
      id: String(chirp.id),
      content: isRepost ? String(chirp.original_content || '') : String(chirp.content),
      createdAt: chirp.createdAt ? new Date(chirp.createdAt).toISOString() : new Date().toISOString(),
      replyToId: chirp.replyToId || null,
      // For reposts, show the reposter's info in the header
      author: {
        id: String(chirp.author_id),
        firstName: String(chirp.display_name || 'User').split(' ')[0] || 'User',
        lastName: '',
        email: 'user@chirp.com',
        customHandle: String(chirp.username || 'user'),
        handle: String(chirp.username || 'user'),
        profileImageUrl: chirp.profile_image_url || null,
        bannerImageUrl: chirp.banner_image_url || null
      },
      replyCount: parseInt(chirp.reply_count) || 0,
      reactionCount: parseInt(chirp.reaction_count) || 0,
      repostCount: parseInt(chirp.repost_count) || 0,
      reactions: [],
      isWeeklySummary: Boolean(isRepost ? chirp.original_is_weekly_summary : chirp.isWeeklySummary),
      // Repost-specific fields
      isRepost,
      repostOfId: chirp.repost_of_id ? String(chirp.repost_of_id) : null,
      originalChirp: isRepost ? {
        id: String(chirp.original_chirp_id),
        content: String(chirp.original_content || ''),
        createdAt: chirp.original_created_at ? new Date(chirp.original_created_at).toISOString() : new Date().toISOString(),
        author: {
          id: String(chirp.original_author_id),
          firstName: String(chirp.original_display_name || 'User').split(' ')[0] || 'User',
          lastName: '',
          customHandle: String(chirp.original_username || 'user'),
          handle: String(chirp.original_username || 'user'),
          profileImageUrl: chirp.original_profile_image_url || null,
        },
        isWeeklySummary: Boolean(chirp.original_is_weekly_summary)
      } : undefined
    };
  }) as MobileChirp[];
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
        COALESCE(first_name, custom_handle, handle) as display_name,
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

// Get user by email for authentication
export async function getUserByEmail(email: string) {
  try {
    console.log('Looking up user by email:', email);
    const users = await sql`
      SELECT 
        id::text,
        email,
        first_name,
        last_name,
        custom_handle,
        handle,
        COALESCE(first_name, custom_handle, handle) as display_name,
        bio,
        profile_image_url,
        banner_image_url,
        is_chirp_plus,
        chirp_plus_expires_at,
        show_chirp_plus_badge,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;
    
    if (users.length > 0) {
      console.log('Found user:', users[0].custom_handle || users[0].handle || users[0].id);
      console.log('Chirp+ status:', users[0].is_chirp_plus ? 'Active' : 'Inactive');
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('User lookup error:', error);
    return null;
  }
}

// Get @chirp preview user for demo mode
export async function getFirstUser() {
  try {
    console.log('Getting @chirp preview user for demo mode...');
    // First try to get the @chirp preview user
    const chirpUser = await sql`
      SELECT 
        id::text,
        email,
        first_name,
        last_name,
        custom_handle,
        handle,
        COALESCE(first_name, custom_handle, handle) as display_name,
        bio,
        profile_image_url,
        banner_image_url,
        is_chirp_plus,
        chirp_plus_expires_at,
        show_chirp_plus_badge,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      WHERE LOWER(custom_handle) = 'chirp' OR LOWER(handle) = 'chirp'
      ORDER BY CASE WHEN LOWER(custom_handle) = 'chirp' THEN 1 ELSE 2 END
      LIMIT 1
    `;
    
    if (chirpUser.length > 0) {
      console.log('Using @chirp preview user:', chirpUser[0].custom_handle || chirpUser[0].handle || chirpUser[0].id);
      console.log('Chirp+ status:', chirpUser[0].is_chirp_plus ? 'Active' : 'Inactive');
      return chirpUser[0];
    }
    
    // Fallback to first available user if @chirp doesn't exist
    const users = await sql`
      SELECT 
        id::text,
        email,
        first_name,
        last_name,
        custom_handle,
        handle,
        COALESCE(first_name, custom_handle, handle) as display_name,
        bio,
        profile_image_url,
        banner_image_url,
        is_chirp_plus,
        chirp_plus_expires_at,
        show_chirp_plus_badge,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      ORDER BY id
      LIMIT 1
    `;
    
    if (users.length > 0) {
      console.log('Fallback - using first user:', users[0].custom_handle || users[0].handle || users[0].id);
      console.log('Chirp+ status:', users[0].is_chirp_plus ? 'Active' : 'Inactive');
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('Demo user fetch error:', error);
    return null;
  }
}

// Get user's chirps for profile display
export async function getUserChirps(userId: string) {
  try {
    console.log('Fetching chirps for user:', userId);
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count
      FROM chirps c
      WHERE c.author_id = ${userId}
      ORDER BY c.created_at DESC
      LIMIT 10
    `;
    
    console.log(`Found ${chirps.length} chirps for user`);
    return chirps;
  } catch (error) {
    console.error('Error fetching user chirps:', error);
    return [];
  }
}

// Get user stats (chirp count, followers, following)
export async function getUserStats(userId: string) {
  try {
    console.log('Fetching stats for user:', userId);
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM chirps WHERE author_id = ${userId}) as chirps,
        (SELECT COUNT(*) FROM follows WHERE following_id = ${userId}) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ${userId}) as following
    `;
    
    const userStats = {
      chirps: Number(stats[0]?.chirps || 0),
      followers: Number(stats[0]?.followers || 0), 
      following: Number(stats[0]?.following || 0)
    };
    
    console.log('User stats:', userStats);
    return userStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { chirps: 0, followers: 0, following: 0 };
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

// Get chirps by hashtag in trending order (engagement + recency)
export async function getChirpsByHashtag(hashtag: string): Promise<MobileChirp[]> {
  try {
    console.log('Fetching chirps for hashtag:', hashtag);
    
    // Remove # from hashtag if present and escape for regex
    const cleanHashtag = hashtag.replace(/^#/, '');
    const hashtagPattern = `#${cleanHashtag}`;
    
    const chirps = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at as "createdAt",
        c.author_id,
        c.reply_to_id,
        c.repost_of_id,
        c.is_weekly_summary,
        u.custom_handle,
        u.handle,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle, 'User') as display_name,
        u.profile_image_url,
        u.banner_image_url,
        COUNT(DISTINCT r.id) as reaction_count,
        COUNT(DISTINCT replies.id) as reply_count,
        COUNT(DISTINCT reposts.id) as repost_count,
        ARRAY_AGG(DISTINCT jsonb_build_object('emoji', r.emoji, 'count', 1)) FILTER (WHERE r.emoji IS NOT NULL) as reactions
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN reactions r ON c.id = r.chirp_id
      LEFT JOIN chirps replies ON c.id = replies.reply_to_id
      LEFT JOIN reposts ON c.id = reposts.chirp_id
      WHERE c.content ILIKE ${'%' + hashtagPattern + '%'}
        AND c.reply_to_id IS NULL -- Only original chirps, not replies
      GROUP BY c.id, c.content, c.created_at, c.author_id, c.reply_to_id, c.repost_of_id, c.is_weekly_summary,
               u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.banner_image_url
      ORDER BY 
        -- Trending algorithm: weight recent posts with engagement
        (COUNT(DISTINCT r.id) + COUNT(DISTINCT replies.id) + COUNT(DISTINCT reposts.id)) * 
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600 DESC,
        c.created_at DESC
      LIMIT 50
    `;
    
    return formatChirpResults(chirps);
  } catch (error) {
    console.error('Error fetching chirps by hashtag:', error);
    return [];
  }
}

// Create subscription with specific product ID
export async function createSubscription(productId: string = "com.kriselle.chirp.plus.monthly") {
  try {
    console.log(`Creating subscription with product ID: ${productId}`);
    
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ productId })
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    const result = await response.json();
    console.log('Subscription created:', result);
    return result;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

// Handle in-app purchase verification
export async function verifyPurchase(receiptData: any, productId: string = "com.kriselle.chirp.plus.monthly") {
  try {
    console.log(`Verifying purchase for product ID: ${productId}`);
    
    const response = await fetch('/api/verify-purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        receiptData, 
        productId 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to verify purchase');
    }

    const result = await response.json();
    console.log('Purchase verified:', result);
    return result;
  } catch (error) {
    console.error('Error verifying purchase:', error);
    throw error;
  }
}

// Get user subscription status
export async function getSubscriptionStatus() {
  try {
    const response = await fetch('/api/subscription', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (response.status === 404) {
      return { hasSubscription: false };
    }

    if (!response.ok) {
      throw new Error('Failed to get subscription status');
    }

    const result = await response.json();
    return { hasSubscription: true, ...result };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return { hasSubscription: false };
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
        COALESCE(first_name, custom_handle, handle) as display_name,
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

// Get user's current reaction for a chirp (single reaction system)
export async function getUserReactionForChirp(chirpId: string, userId: string): Promise<string | null> {
  try {
    const result = await sql`
      SELECT emoji FROM reactions 
      WHERE chirp_id = ${chirpId} AND user_id = ${userId}
      LIMIT 1
    `;
    
    return result.length > 0 ? result[0].emoji : null;
  } catch (error) {
    console.error('Error getting user reaction:', error);
    return null;
  }
}

// Get count of specific emoji reactions for a chirp
export async function getEmojiReactionCount(chirpId: string, emoji: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM reactions 
      WHERE chirp_id = ${chirpId} AND emoji = ${emoji}
    `;
    
    return parseInt(result[0].count) || 0;
  } catch (error) {
    console.error('Error getting emoji reaction count:', error);
    return 0;
  }
}

export async function addReaction(chirpId: string, emoji: string, userId: string) {
  try {
    console.log('Adding reaction:', emoji, 'to chirp:', chirpId, 'by user:', userId);
    
    // Get current user reaction to check if it's the same emoji (toggle behavior)
    const currentReaction = await getUserReactionForChirp(chirpId, userId);
    
    if (currentReaction === emoji) {
      // Same emoji - remove it (toggle off)
      await sql`
        DELETE FROM reactions 
        WHERE chirp_id = ${chirpId} AND user_id = ${userId}
      `;
      console.log('Removed reaction (toggled off)');
      return { added: false, emoji: null };
    } else {
      // Different emoji or no previous reaction - replace/add
      // First remove any existing reaction
      await sql`
        DELETE FROM reactions 
        WHERE chirp_id = ${chirpId} AND user_id = ${userId}
      `;
      
      // Add new reaction
      await sql`
        INSERT INTO reactions (chirp_id, user_id, emoji, created_at)
        VALUES (${chirpId}, ${userId}, ${emoji}, NOW())
      `;
      console.log('Added reaction');
      return { added: true, emoji };
    }
  } catch (error) {
    console.error('Error managing reaction:', error);
    throw error;
  }
}

// Delete a chirp (only by the author) - with fallback API approach
export async function deleteChirp(chirpId: string, userId: string): Promise<void> {
  try {
    console.log(`🗑️ Starting deleteChirp function`);
    console.log(`Chirp ID: ${chirpId} (type: ${typeof chirpId})`);
    console.log(`User ID: ${userId} (type: ${typeof userId})`);
    
    // Try direct database approach first
    try {
      console.log('🔍 Attempting direct database deletion...');
      
      // First verify the user owns the chirp
      const chirpCheck = await sql`
        SELECT author_id::text FROM chirps WHERE id = ${chirpId}
      `;
      
      console.log('📋 Chirp check result:', chirpCheck);
      
      if (chirpCheck.length === 0) {
        console.log('❌ Chirp not found in database');
        throw new Error('Chirp not found');
      }
      
      const authorId = chirpCheck[0].author_id;
      console.log(`🔐 Chirp author: ${authorId}, Requesting user: ${userId}`);
      
      if (authorId !== userId) {
        console.log('❌ User does not own this chirp');
        throw new Error(`You can only delete your own chirps. Author: ${authorId}, User: ${userId}`);
      }
      
      console.log('✅ Ownership verified, proceeding with deletion...');
      
      // Delete the chirp (cascade will handle reactions and replies)
      const deleteResult = await sql`
        DELETE FROM chirps WHERE id = ${chirpId} AND author_id = ${userId}
      `;
      
      console.log('🗑️ Delete result:', deleteResult);
      console.log('✅ Chirp deleted successfully from database');
      
    } catch (dbError) {
      console.log('❌ Direct database approach failed, trying API fallback...');
      console.error('Database error:', dbError);
      
      // Fallback to API approach if direct database fails
      try {
        const response = await fetch(`/api/chirps/${chirpId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`API deletion failed: ${error}`);
        }
        
        console.log('✅ Chirp deleted successfully via API fallback');
      } catch (apiError) {
        console.error('❌ API fallback also failed:', apiError);
        throw new Error(`Both database and API deletion failed: ${dbError.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error in deleteChirp function:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    throw error;
  }
}

// Create a reply to a chirp
export async function createReply(content: string, replyToId: string, authorId: string): Promise<MobileChirp | null> {
  try {
    console.log('Creating reply to chirp:', replyToId, 'by user:', authorId);
    
    if (!authorId) {
      throw new Error('Author ID is required to create a reply');
    }
    
    // Filter content same as regular chirps
    let filteredContent = content;
    if (filteredContent && typeof filteredContent === 'string') {
      filteredContent = filteredContent.replace(/https?:\/\/[^\s]+/gi, '[link removed]');
      filteredContent = filteredContent.replace(/www\.[^\s]+/gi, '[link removed]');
      filteredContent = filteredContent.replace(/(?<!@)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, '[link removed]');
    }
    
    if (!filteredContent.trim()) {
      throw new Error('Reply content cannot be empty');
    }
    
    if (filteredContent.length > 280) {
      throw new Error('Reply content too long');
    }
    
    const result = await sql`
      INSERT INTO chirps (content, author_id, reply_to_id, created_at)
      VALUES (${filteredContent}, ${authorId}, ${replyToId}, NOW())
      RETURNING 
        id::text,
        content,
        created_at as "createdAt",
        author_id,
        reply_to_id
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const newReply = result[0];
    
    // Get author details
    const authorResult = await sql`
      SELECT 
        id::text,
        COALESCE(custom_handle, handle, CAST(id AS text), 'user') as username,
        COALESCE(first_name, custom_handle, handle) as display_name,
        profile_image_url
      FROM users 
      WHERE id = ${authorId}
    `;
    
    const author = authorResult[0] || {
      id: authorId,
      username: 'user',
      display_name: 'User',
      profile_image_url: null
    };
    
    console.log('Successfully created reply:', newReply.id);
    
    return {
      id: newReply.id,
      content: newReply.content,
      createdAt: newReply.createdAt,
      isWeeklySummary: false,
      author: {
        id: author.id,
        firstName: author.display_name?.split(' ')[0] || author.username || 'User',
        lastName: "",
        email: `${author.username}@chirp.com`,
        handle: author.username,
        customHandle: author.username,
        profileImageUrl: author.profile_image_url,
      },
      replyCount: 0,
      reactionCount: 0,
      reactions: [],
    };
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
}

// Get replies for a specific chirp with proper hierarchy
export async function getChirpReplies(chirpId: string): Promise<MobileChirp[]> {
  try {
    console.log('Fetching replies for chirp:', chirpId);
    
    // First get all direct replies to the original chirp
    const directReplies = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at as "createdAt",
        c.author_id,
        c.reply_to_id,
        u.custom_handle,
        u.handle,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle, 'User') as display_name,
        u.profile_image_url,
        u.banner_image_url,
        COUNT(DISTINCT r.id) as reaction_count,
        COUNT(DISTINCT replies.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN reactions r ON c.id = r.chirp_id
      LEFT JOIN chirps replies ON c.id = replies.reply_to_id
      WHERE c.reply_to_id = ${chirpId}
      GROUP BY c.id, c.content, c.created_at, c.author_id, c.reply_to_id, u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.banner_image_url
      ORDER BY c.created_at ASC
    `;
    
    const formattedDirectReplies = formatChirpResults(directReplies);
    
    // For each direct reply, get its nested replies (replies to replies)
    const repliesWithNested = await Promise.all(
      formattedDirectReplies.map(async (reply) => {
        const nestedReplies = await getNestedReplies(reply.id);
        return {
          ...reply,
          nestedReplies,
          isDirectReply: true // Mark as direct reply to original chirp
        };
      })
    );
    
    return repliesWithNested;
  } catch (error) {
    console.error('Error fetching chirp replies:', error);
    throw error;
  }
}

// Helper function to get nested replies (replies to replies)
async function getNestedReplies(replyId: string): Promise<MobileChirp[]> {
  try {
    const nestedReplies = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at as "createdAt",
        c.author_id,
        c.reply_to_id,
        u.custom_handle,
        u.handle,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle, 'User') as display_name,
        u.profile_image_url,
        u.banner_image_url,
        COUNT(DISTINCT r.id) as reaction_count,
        COUNT(DISTINCT replies.id) as reply_count
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN reactions r ON c.id = r.chirp_id
      LEFT JOIN chirps replies ON c.id = replies.reply_to_id
      WHERE c.reply_to_id = ${replyId}
      GROUP BY c.id, c.content, c.created_at, c.author_id, c.reply_to_id, u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.banner_image_url
      ORDER BY c.created_at ASC
    `;
    
    const formatted = formatChirpResults(nestedReplies);
    return formatted.map(reply => ({
      ...reply,
      isNestedReply: true // Mark as nested reply
    }));
  } catch (error) {
    console.error('Error fetching nested replies:', error);
    return [];
  }
}

// Create a repost of a chirp - creates actual chirp entries that appear in feeds
// Check if user has reposted a specific chirp
export async function checkUserReposted(userId: string, chirpId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM chirps 
      WHERE author_id = ${userId} AND repost_of_id = ${chirpId}
      LIMIT 1
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking user repost status:', error);
    return false;
  }
}

export async function createRepost(originalChirpId: string, userId: string) {
  try {
    console.log('Creating repost of chirp:', originalChirpId, 'by user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required to create a repost');
    }
    
    // Check if user already has a repost chirp for this original chirp
    const existingRepostChirp = await sql`
      SELECT id FROM chirps 
      WHERE repost_of_id = ${originalChirpId} AND author_id = ${userId}
      LIMIT 1
    `;
    
    if (existingRepostChirp.length > 0) {
      // Remove existing repost chirp (toggle off)
      const repostChirpId = existingRepostChirp[0].id;
      await sql`
        DELETE FROM chirps 
        WHERE id = ${repostChirpId} AND author_id = ${userId}
      `;
      
      // Also remove from reposts tracking table
      await sql`
        DELETE FROM reposts 
        WHERE chirp_id = ${originalChirpId} AND user_id = ${userId}
      `;
      
      console.log('Removed repost chirp from timeline');
      return { reposted: false, repostChirpId: null };
    } else {
      // Create new repost chirp entry that will appear in feeds
      const repostResult = await sql`
        INSERT INTO chirps (author_id, content, repost_of_id, created_at)
        VALUES (${userId}, '', ${originalChirpId}, NOW())
        RETURNING id
      `;
      
      const repostChirpId = repostResult[0].id;
      
      // Add entry to reposts tracking table for additional repost functionality
      await sql`
        INSERT INTO reposts (chirp_id, user_id, created_at)
        VALUES (${originalChirpId}, ${userId}, NOW())
        ON CONFLICT (chirp_id, user_id) DO NOTHING
      `;
      
      // Create notification for the original chirp author
      const originalChirp = await sql`
        SELECT author_id FROM chirps WHERE id = ${originalChirpId}
      `;
      
      if (originalChirp.length > 0 && originalChirp[0].author_id !== userId) {
        await sql`
          INSERT INTO notifications (user_id, type, from_user_id, chirp_id, created_at)
          VALUES (${originalChirp[0].author_id}, 'repost', ${userId}, ${originalChirpId}, NOW())
        `;
        console.log('Created repost notification for original author');
      }
      
      console.log('Created repost chirp that will appear in timeline:', repostChirpId);
      return { reposted: true, repostChirpId };
    }
  } catch (error) {
    console.error('Error managing repost:', error);
    throw error;
  }
}

// Get current authenticated user ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    console.log('🔍 Validating current user...');
    
    // Get current user from AsyncStorage
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('✅ User validation complete - ID:', user.id);
      return user.id;
    }
    
    console.log('❌ No current user found');
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

// Check if user has reposted a chirp
export async function getUserRepostStatus(chirpId: string, userId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM reposts 
      WHERE chirp_id = ${chirpId} AND user_id = ${userId}
      LIMIT 1
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking repost status:', error);
    return false;
  }
}

// Check if user has active Chirp+ subscription
export function isChirpPlusActive(user: any): boolean {
  if (!user || !user.is_chirp_plus) {
    return false;
  }
  
  // If no expiration date, consider it active (lifetime or special cases)
  if (!user.chirp_plus_expires_at) {
    return true;
  }
  
  // Check if subscription hasn't expired
  const expirationDate = new Date(user.chirp_plus_expires_at);
  const now = new Date();
  
  return expirationDate > now;
}

// Get user's current subscription status with validation
export async function getUserSubscriptionStatus(userId: string) {
  try {
    console.log('Checking subscription status for user:', userId);
    
    const users = await sql`
      SELECT 
        id::text,
        is_chirp_plus,
        chirp_plus_expires_at,
        show_chirp_plus_badge,
        stripe_customer_id,
        stripe_subscription_id
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;
    
    if (users.length === 0) {
      return {
        isActive: false,
        isSubscribed: false,
        expiresAt: null,
        showBadge: false
      };
    }
    
    const user = users[0];
    const isActive = isChirpPlusActive(user);
    
    // If subscription expired, update database status
    if (user.is_chirp_plus && !isActive) {
      console.log('Subscription expired, updating database status');
      await sql`
        UPDATE users 
        SET is_chirp_plus = false 
        WHERE id = ${userId}
      `;
    }
    
    return {
      isActive: isActive,
      isSubscribed: user.is_chirp_plus,
      expiresAt: user.chirp_plus_expires_at,
      showBadge: user.show_chirp_plus_badge && isActive,
      stripeCustomerId: user.stripe_customer_id,
      stripeSubscriptionId: user.stripe_subscription_id
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      isSubscribed: false,
      expiresAt: null,
      showBadge: false
    };
  }
}

// Settings and profile management functions
export async function updateUserProfile(userId: string, updates: {
  first_name?: string;
  last_name?: string;
  bio?: string;
  link_in_bio?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
}): Promise<MobileUser> {
  try {
    const result = await sql`
      UPDATE users 
      SET 
        first_name = COALESCE(${updates.first_name}, first_name),
        last_name = COALESCE(${updates.last_name}, last_name),
        bio = COALESCE(${updates.bio}, bio),
        link_in_bio = COALESCE(${updates.link_in_bio}, link_in_bio),
        profile_image_url = COALESCE(${updates.profileImageUrl}, profile_image_url),
        banner_image_url = COALESCE(${updates.bannerImageUrl}, banner_image_url),
        updated_at = NOW()
      WHERE id = ${userId}
      RETURNING 
        id::text,
        email,
        handle,
        custom_handle,
        first_name,
        last_name,
        bio,
        profile_image_url,
        banner_image_url,
        link_in_bio,
        is_chirp_plus,
        show_chirp_plus_badge,
        created_at,
        updated_at
    `;
    
    if (result.length === 0) {
      throw new Error('User not found');
    }
    
    return {
      id: result[0].id,
      username: result[0].handle,
      displayName: `${result[0].first_name || ''} ${result[0].last_name || ''}`.trim(),
      bio: result[0].bio,
      avatarUrl: result[0].profile_image_url,
      bannerUrl: result[0].banner_image_url,
      linkInBio: result[0].link_in_bio,
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function cancelSubscription(userId: string): Promise<void> {
  try {
    await sql`
      UPDATE users 
      SET 
        is_chirp_plus = false,
        show_chirp_plus_badge = false,
        stripe_subscription_id = NULL,
        updated_at = NOW()
      WHERE id = ${userId}
    `;
    console.log('Subscription cancelled successfully');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

// Follow/Unfollow functionality
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log(`User ${followerId} attempting to follow user ${followingId}`);
    
    // Check if already following
    const existingFollow = await sql`
      SELECT id FROM follows 
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
      LIMIT 1
    `;
    
    if (existingFollow.length > 0) {
      console.log('Already following this user');
      return false; // Already following
    }
    
    // Add follow relationship
    await sql`
      INSERT INTO follows (follower_id, following_id, created_at)
      VALUES (${followerId}, ${followingId}, NOW())
    `;
    
    console.log('Successfully followed user');
    return true; // Follow added
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    console.log(`User ${followerId} attempting to unfollow user ${followingId}`);
    
    const result = await sql`
      DELETE FROM follows 
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `;
    
    console.log('Successfully unfollowed user');
    return true; // Unfollow successful
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

// Block functionality
export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    console.log(`User ${blockerId} attempting to block user ${blockedId}`);
    
    // Check if already blocked
    const existingBlock = await sql`
      SELECT id FROM user_blocks 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
      LIMIT 1
    `;
    
    if (existingBlock.length > 0) {
      console.log('User already blocked');
      return false; // Already blocked
    }
    
    // Add block relationship and remove any follow relationships
    await sql`
      INSERT INTO user_blocks (blocker_id, blocked_id, created_at)
      VALUES (${blockerId}, ${blockedId}, NOW())
    `;
    
    // Remove any existing follow relationships
    await sql`
      DELETE FROM follows 
      WHERE (follower_id = ${blockerId} AND following_id = ${blockedId})
         OR (follower_id = ${blockedId} AND following_id = ${blockerId})
    `;
    
    console.log('Successfully blocked user');
    return true; // Block added
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    console.log(`User ${blockerId} attempting to unblock user ${blockedId}`);
    
    const result = await sql`
      DELETE FROM user_blocks 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
    `;
    
    console.log('Successfully unblocked user');
    return true; // Unblock successful
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

export async function checkFollowStatus(currentUserId: string, targetUserId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM follows 
      WHERE follower_id = ${currentUserId} AND following_id = ${targetUserId}
      LIMIT 1
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
}

export async function checkBlockStatus(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT id FROM user_blocks 
      WHERE blocker_id = ${blockerId} AND blocked_id = ${blockedId}
      LIMIT 1
    `;
    
    return result.length > 0;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}

// Notification settings functionality
export async function toggleUserNotifications(userId: string, targetUserId: string): Promise<boolean> {
  try {
    console.log(`User ${userId} toggling notifications for user ${targetUserId}`);
    
    // Check if notifications are currently enabled
    const existingNotificationSetting = await sql`
      SELECT id, notify_on_post FROM user_notification_settings 
      WHERE user_id = ${userId} AND followed_user_id = ${targetUserId}
      LIMIT 1
    `;
    
    if (existingNotificationSetting.length > 0) {
      // Toggle existing setting
      const newState = !existingNotificationSetting[0].notify_on_post;
      await sql`
        UPDATE user_notification_settings 
        SET notify_on_post = ${newState}, created_at = NOW()
        WHERE user_id = ${userId} AND followed_user_id = ${targetUserId}
      `;
      console.log(`Notifications ${newState ? 'enabled' : 'disabled'} for user`);
      return newState;
    } else {
      // Create new setting (default to enabled)
      await sql`
        INSERT INTO user_notification_settings (user_id, followed_user_id, notify_on_post, created_at)
        VALUES (${userId}, ${targetUserId}, true, NOW())
      `;
      console.log('Notifications enabled for user');
      return true;
    }
  } catch (error) {
    console.error('Error toggling user notifications:', error);
    throw error;
  }
}

export async function getUserNotificationStatus(userId: string, targetUserId: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT notify_on_post FROM user_notification_settings 
      WHERE user_id = ${userId} AND followed_user_id = ${targetUserId}
      LIMIT 1
    `;
    
    // Default to enabled if no setting exists
    return result.length > 0 ? result[0].notify_on_post : true;
  } catch (error) {
    console.error('Error checking notification status:', error);
    return true; // Default to enabled
  }
}

// Update Chirp+ badge visibility
export async function updateChirpPlusBadgeVisibility(userId: string, showBadge: boolean): Promise<void> {
  try {
    console.log('Updating badge visibility for user:', userId, 'show:', showBadge);
    
    const result = await sql`
      UPDATE users 
      SET show_chirp_plus_badge = ${showBadge}
      WHERE id = ${userId}
      RETURNING id
    `;
    
    if (result.length === 0) {
      throw new Error('User not found');
    }
    
    console.log('Badge visibility updated successfully');
  } catch (error) {
    console.error('Error updating badge visibility:', error);
    throw error;
  }
}

// Feedback submission function
export async function submitFeedback(feedback: {
  name: string;
  email: string;
  category: string;
  message: string;
}): Promise<void> {
  try {
    console.log('Submitting feedback to database...');
    await sql`
      INSERT INTO feedback (name, email, category, message, created_at)
      VALUES (${feedback.name}, ${feedback.email}, ${feedback.category}, ${feedback.message}, NOW())
    `;
    console.log('Feedback submitted successfully');
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}

// Trigger notification for reactions (will send push notification)
export async function triggerReactionNotification(authorId: string, reactorId: string, chirpId: number) {
  try {
    if (authorId === reactorId) return; // Don't notify self

    const response = await fetch(`/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: authorId,
        type: 'reaction',
        fromUserId: reactorId,
        chirpId: chirpId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger reaction notification');
    }

    console.log('Reaction notification triggered successfully');
  } catch (error) {
    console.error('Error triggering reaction notification:', error);
  }
}

// Trigger notification for follows (will send push notification)
export async function triggerFollowNotification(followedUserId: string, followerId: string) {
  try {
    if (followedUserId === followerId) return; // Don't notify self

    const response = await fetch(`/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: followedUserId,
        type: 'follow',
        fromUserId: followerId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger follow notification');
    }

    console.log('Follow notification triggered successfully');
  } catch (error) {
    console.error('Error triggering follow notification:', error);
  }
}

// Trigger notification for replies (will send push notification)
export async function triggerReplyNotification(originalAuthorId: string, replierId: string, chirpId: number) {
  try {
    if (originalAuthorId === replierId) return; // Don't notify self

    const response = await fetch(`/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: originalAuthorId,
        type: 'reply',
        fromUserId: replierId,
        chirpId: chirpId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger reply notification');
    }

    console.log('Reply notification triggered successfully');
  } catch (error) {
    console.error('Error triggering reply notification:', error);
  }
}

// Trigger notification for reposts (will send push notification)
export async function triggerRepostNotification(originalAuthorId: string, reposterId: string, chirpId: number) {
  try {
    if (originalAuthorId === reposterId) return; // Don't notify self

    const response = await fetch(`/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: originalAuthorId,
        type: 'repost',
        fromUserId: reposterId,
        chirpId: chirpId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to trigger repost notification');
    }

    console.log('Repost notification triggered successfully');
  } catch (error) {
    console.error('Error triggering repost notification:', error);
  }
}

