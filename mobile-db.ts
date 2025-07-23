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
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
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
        lastName: author.display_name?.split(' ').slice(1).join(' ') || '',
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
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
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

// Get first available user for demo mode
export async function getFirstUser() {
  try {
    console.log('Getting first available user for demo mode...');
    const users = await sql`
      SELECT 
        id::text,
        email,
        first_name,
        last_name,
        custom_handle,
        handle,
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
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
      console.log('Using demo user:', users[0].custom_handle || users[0].handle || users[0].id);
      console.log('Chirp+ status:', users[0].is_chirp_plus ? 'Active' : 'Inactive');
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('Demo user fetch error:', error);
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

// Add reaction to a chirp
export async function addReaction(chirpId: string, emoji: string, userId: string) {
  try {
    console.log('Adding reaction:', emoji, 'to chirp:', chirpId, 'by user:', userId);
    
    // Check if reaction already exists
    const existingReaction = await sql`
      SELECT id FROM reactions 
      WHERE chirp_id = ${chirpId} AND user_id = ${userId} AND emoji = ${emoji}
      LIMIT 1
    `;
    
    if (existingReaction.length > 0) {
      // Remove existing reaction (toggle off)
      await sql`
        DELETE FROM reactions 
        WHERE chirp_id = ${chirpId} AND user_id = ${userId} AND emoji = ${emoji}
      `;
      console.log('Removed reaction');
      return false; // Reaction removed
    } else {
      // Add new reaction
      await sql`
        INSERT INTO reactions (chirp_id, user_id, emoji, created_at)
        VALUES (${chirpId}, ${userId}, ${emoji}, NOW())
      `;
      console.log('Added reaction');
      return true; // Reaction added
    }
  } catch (error) {
    console.error('Error managing reaction:', error);
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
        COALESCE(first_name || ' ' || last_name, custom_handle, handle) as display_name,
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
        lastName: author.display_name?.split(' ').slice(1).join(' ') || '',
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

// Get replies for a specific chirp
export async function getChirpReplies(chirpId: string): Promise<MobileChirp[]> {
  try {
    console.log('Fetching replies for chirp:', chirpId);
    
    const replies = await sql`
      SELECT 
        c.id,
        c.content,
        c.created_at as "createdAt",
        c.author_id,
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
      GROUP BY c.id, c.content, c.created_at, c.author_id, u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.banner_image_url
      ORDER BY c.created_at ASC
    `;
    
    return formatChirpResults(replies);
  } catch (error) {
    console.error('Error fetching chirp replies:', error);
    throw error;
  }
}

// Create a repost of a chirp
export async function createRepost(originalChirpId: string, userId: string) {
  try {
    console.log('Creating repost of chirp:', originalChirpId, 'by user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required to create a repost');
    }
    
    // Check if user already reposted this chirp
    const existingRepost = await sql`
      SELECT id FROM reposts 
      WHERE chirp_id = ${originalChirpId} AND user_id = ${userId}
      LIMIT 1
    `;
    
    if (existingRepost.length > 0) {
      // Remove existing repost (toggle off)
      await sql`
        DELETE FROM reposts 
        WHERE chirp_id = ${originalChirpId} AND user_id = ${userId}
      `;
      console.log('Removed repost');
      return false; // Repost removed
    } else {
      // Add new repost
      await sql`
        INSERT INTO reposts (chirp_id, user_id, created_at)
        VALUES (${originalChirpId}, ${userId}, NOW())
      `;
      console.log('Added repost');
      return true; // Repost added
    }
  } catch (error) {
    console.error('Error managing repost:', error);
    throw error;
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
}): Promise<MobileUser> {
  try {
    const result = await sql`
      UPDATE users 
      SET 
        first_name = COALESCE(${updates.first_name}, first_name),
        last_name = COALESCE(${updates.last_name}, last_name),
        bio = COALESCE(${updates.bio}, bio),
        link_in_bio = COALESCE(${updates.link_in_bio}, link_in_bio),
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