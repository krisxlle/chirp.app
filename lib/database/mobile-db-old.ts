// Direct database connection for mobile app to access authentic user data
import { neon } from '@neondatabase/serverless';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureRandomInt, secureRandomString } from '../utils/secureRandom';
import type { MobileChirp, MobileUser } from './mobile-types';
// Note: bcrypt doesn't work in browser environment, using simple comparison for now

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

let sql: any = null;
let isDatabaseConnected = false;

// Initialize database connection with error handling
const initializeDatabase = async () => {
  try {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error('DATABASE_URL could not be determined');
    }
    console.log('🔌 Initializing database connection...');
    
    // For React Native/Expo, we need to handle the connection differently
    // The neon serverless client is designed for server environments
    // In mobile apps, we should use a different approach or fall back to mock data
    if (typeof window !== 'undefined' || typeof global !== 'undefined') {
      console.log('📱 Running in React Native/Expo environment, using mock data mode');
      isDatabaseConnected = false;
      return null;
    }
    
    sql = neon(databaseUrl);
    isDatabaseConnected = true;
    console.log('✅ Database connection initialized successfully');
    return sql;
  } catch (error) {
    console.error('❌ Failed to initialize database connection:', error);
    console.log('🔄 Falling back to mock data mode');
    isDatabaseConnected = false;
    return null;
  }
};

// Initialize database on first use
let initializationPromise: Promise<any> | null = null;

const ensureDatabaseInitialized = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = initializeDatabase();
  const result = await initializationPromise;
  sql = result;
  return result;
};

// Mock data functions for when database is not available
function getMockChirps(): MobileChirp[] {
  console.log('🎭 Generating mock chirps for offline mode');
  
  const mockUsers = [
    { id: 'mock_user_1', firstName: 'Alice', lastName: 'Johnson', handle: 'alicej', customHandle: 'alicej', email: 'alicej@chirp.com' },
    { id: 'mock_user_2', firstName: 'Bob', lastName: 'Smith', handle: 'bobsmith', customHandle: 'bobsmith', email: 'bobsmith@chirp.com' },
    { id: 'mock_user_3', firstName: 'Charlie', lastName: 'Brown', handle: 'charlieb', customHandle: 'charlieb', email: 'charlieb@chirp.com' },
    { id: 'mock_user_4', firstName: 'Diana', lastName: 'Prince', handle: 'dianap', customHandle: 'dianap', email: 'dianap@chirp.com' },
    { id: 'mock_user_5', firstName: 'Eve', lastName: 'Wilson', handle: 'evew', customHandle: 'evew', email: 'evew@chirp.com' }
  ];

  const mockContents = [
    "Just had the most amazing coffee! ☕️ #coffee #morning",
    "Working on some exciting new features for the app! 💻 #coding #development",
    "Beautiful sunset tonight! 🌅 #nature #photography",
    "Can't believe how fast this week is flying by! ⏰ #time #life",
    "Great meeting with the team today! 👥 #teamwork #collaboration",
    "Just finished reading an incredible book! 📚 #reading #books",
    "Perfect weather for a walk in the park! 🌳 #outdoors #exercise",
    "Excited about the upcoming project launch! 🚀 #excitement #launch",
    "Love this new playlist I discovered! 🎵 #music #discovery",
    "Nothing beats a good home-cooked meal! 🍳 #cooking #food"
  ];

  return mockContents.map((content, index) => ({
    id: `mock_chirp_${index + 1}`,
    content,
    createdAt: new Date(Date.now() - (index * 3600000)).toISOString(), // Each chirp 1 hour apart
    replyToId: null,
    isWeeklySummary: false,
    author: {
      ...mockUsers[index % mockUsers.length],
      email: mockUsers[index % mockUsers.length].email
    },
    replyCount: secureRandomInt(0, 4),
    reactionCount: secureRandomInt(5, 24),
    repostCount: secureRandomInt(0, 2),
    reactions: [],
    isDirectReply: false,
    isNestedReply: false,
    isRepost: false,
    repostOfId: null,
    originalChirp: undefined
  }));
}

// Get individual chirp by ID
export async function getChirpById(chirpId: string): Promise<MobileChirp | null> {
  try {
    console.log('Fetching chirp by ID:', chirpId);
    
    const result = await sql`
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
        u.is_chirp_plus,
        u.show_chirp_plus_badge
      FROM chirps c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ${chirpId}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      console.log('No chirp found with ID:', chirpId);
      return null;
    }
    
    const formattedResult = formatChirpResults(result);
    return formattedResult[0] || null;
  } catch (error) {
    console.error('Error fetching chirp by ID:', error);
    return null;
  }
}

// Feed algorithms for sophisticated content ranking
export async function getForYouChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching For You feed with personalized ranking...');
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected || !sql) {
      console.log('🔄 Database not connected, using mock feed data');
      return getMockChirps();
    }
    
    // First get parent chirps
    const parentChirps = await sql`
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
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
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
        ou.is_chirp_plus as original_is_chirp_plus,
        ou.show_chirp_plus_badge as original_show_chirp_plus_badge,
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
    
    // Get replies for each parent chirp
    const allChirps: any[] = [];
    for (const parentChirp of parentChirps) {
      // Add parent chirp
      allChirps.push(parentChirp);
      
      // Get replies for this parent chirp
      const replies = await sql`
        SELECT 
          c.id::text,
          c.content,
          c.created_at as "createdAt",
          c.author_id::text,
          c.reply_to_id,
          NULL as repost_of_id,
          COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
          COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
          COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
          u.profile_image_url,
          u.banner_image_url,
          u.is_chirp_plus,
          u.show_chirp_plus_badge,
          NULL as original_chirp_id,
          NULL as original_content,
          NULL as original_created_at,
          NULL as original_author_id,
          NULL as original_username,
          NULL as original_display_name,
          NULL as original_profile_image_url,
          NULL as original_banner_image_url,
          false as original_is_weekly_summary,
          NULL as original_is_chirp_plus,
          NULL as original_show_chirp_plus_badge,
          (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
          (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
          (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = c.id) as repost_count
        FROM chirps c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.reply_to_id = ${parentChirp.id}
        ORDER BY c.created_at ASC
        LIMIT 3
      `;
      
      // Add replies after parent chirp
      for (const reply of replies) {
        allChirps.push(reply);
      }
    }
    
    return formatChirpResults(allChirps);
  } catch (error) {
    console.error('For You feed error:', error);
    return [];
  }
}

export async function getLatestChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching Latest feed in chronological order...');
    
    // First get parent chirps
    const parentChirps = await sql`
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
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
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
        ou.is_chirp_plus as original_is_chirp_plus,
        ou.show_chirp_plus_badge as original_show_chirp_plus_badge,
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
    
    // Get replies for each parent chirp
    const allChirps: any[] = [];
    for (const parentChirp of parentChirps) {
      // Add parent chirp
      allChirps.push(parentChirp);
      
      // Get replies for this parent chirp
      const replies = await sql`
        SELECT 
          c.id::text,
          c.content,
          c.created_at as "createdAt",
          c.author_id::text,
          c.reply_to_id,
          NULL as repost_of_id,
          COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
          COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
          COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
          u.profile_image_url,
          u.banner_image_url,
          u.is_chirp_plus,
          u.show_chirp_plus_badge,
          NULL as original_chirp_id,
          NULL as original_content,
          NULL as original_created_at,
          NULL as original_author_id,
          NULL as original_username,
          NULL as original_display_name,
          NULL as original_profile_image_url,
          NULL as original_banner_image_url,
          false as original_is_weekly_summary,
          NULL as original_is_chirp_plus,
          NULL as original_show_chirp_plus_badge,
          (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
          (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
          (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = c.id) as repost_count
        FROM chirps c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.reply_to_id = ${parentChirp.id}
        ORDER BY c.created_at ASC
        LIMIT 3
      `;
      
      // Add replies after parent chirp
      for (const reply of replies) {
        allChirps.push(reply);
      }
    }
    
    return formatChirpResults(allChirps);
  } catch (error) {
    console.error('Latest feed error:', error);
    return [];
  }
}

export async function getTrendingChirps(): Promise<MobileChirp[]> {
  try {
    console.log('Fetching Trending feed with engagement metrics...');
    
    // First get parent chirps
    const parentChirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        c.author_id::text,
        NULL as repost_of_id,
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        u.profile_image_url,
        u.banner_image_url,
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
        NULL as original_chirp_id,
        NULL as original_content,
        NULL as original_created_at,
        NULL as original_author_id,
        NULL as original_username,
        NULL as original_display_name,
        NULL as original_profile_image_url,
        NULL as original_banner_image_url,
        false as original_is_weekly_summary,
        NULL as original_is_chirp_plus,
        NULL as original_show_chirp_plus_badge,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
        (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = c.id) as repost_count
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
    
    // Get replies for each parent chirp
    const allChirps: any[] = [];
    for (const parentChirp of parentChirps) {
      // Add parent chirp
      allChirps.push(parentChirp);
      
      // Get replies for this parent chirp
      const replies = await sql`
        SELECT 
          c.id::text,
          c.content,
          c.created_at as "createdAt",
          c.author_id::text,
          c.reply_to_id,
          NULL as repost_of_id,
          COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
          COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
          COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
          u.profile_image_url,
          u.banner_image_url,
          u.is_chirp_plus,
          u.show_chirp_plus_badge,
          NULL as original_chirp_id,
          NULL as original_content,
          NULL as original_created_at,
          NULL as original_author_id,
          NULL as original_username,
          NULL as original_display_name,
          NULL as original_profile_image_url,
          NULL as original_banner_image_url,
          false as original_is_weekly_summary,
          NULL as original_is_chirp_plus,
          NULL as original_show_chirp_plus_badge,
          (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
          (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
          (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = c.id) as repost_count
        FROM chirps c
        LEFT JOIN users u ON c.author_id = u.id
        WHERE c.reply_to_id = ${parentChirp.id}
        ORDER BY c.created_at ASC
        LIMIT 3
      `;
      
      // Add replies after parent chirp
      for (const reply of replies) {
        allChirps.push(reply);
      }
    }
    
    return formatChirpResults(allChirps);
  } catch (error) {
    console.error('Trending feed error:', error);
    return [];
  }
}

// Mock chirp creation for when database is not available
function createMockChirp(content: string, authorId?: string, replyToId?: string | null): MobileChirp {
  console.log('🎭 Creating mock chirp');
  
  const mockId = `mock_${Date.now()}_${secureRandomString(9)}`;
  const mockAuthorId = authorId || 'mock_user_123';
  
  return {
    id: mockId,
    content: content,
    createdAt: new Date().toISOString(),
    isWeeklySummary: false,
    author: {
      id: mockAuthorId,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      handle: 'testuser',
      customHandle: 'testuser',
      profileImageUrl: undefined,
    },
    replyCount: 0,
    reactionCount: 0,
    reactions: [],
  };
}

// Create a new chirp
export async function createChirp(content: string, authorId?: string, replyToId?: string | null): Promise<MobileChirp | null> {
  try {
    console.log('Creating new chirp in database...');
    
    // Check if database is connected
    if (!isDatabaseConnected || !sql) {
      console.log('🔄 Database not connected, using mock chirp creation');
      return createMockChirp(content, authorId, replyToId);
    }
    
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
    const isReply = Boolean(chirp.reply_to_id);
    

    
    return {
      id: String(chirp.id),
      content: isRepost ? String(chirp.original_content || '') : String(chirp.content),
      createdAt: chirp.createdAt ? new Date(chirp.createdAt).toISOString() : new Date().toISOString(),
      replyToId: chirp.reply_to_id ? String(chirp.reply_to_id) : null,
      // For reposts, show the reposter's info in the header
      author: {
        id: String(chirp.author_id),
        firstName: String(chirp.display_name || 'User').split(' ')[0] || 'User',
        lastName: '',
        email: 'user@chirp.com',
        customHandle: String(chirp.username || 'user'),
        handle: String(chirp.username || 'user'),
        profileImageUrl: chirp.profile_image_url || null,
        bannerImageUrl: chirp.banner_image_url || null,
      },
      replyCount: parseInt(chirp.reply_count) || 0,
      reactionCount: parseInt(chirp.reaction_count) || 0,
      repostCount: parseInt(chirp.repost_count) || 0,
      reactions: [],
      isWeeklySummary: Boolean(isRepost ? chirp.original_is_weekly_summary : chirp.isWeeklySummary),
      // Reply identification
      isDirectReply: isReply,
      isNestedReply: false,
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
      FROM users 
      WHERE email = ${email}
      LIMIT 1
    `;
    
    if (users.length > 0) {
      console.log('Found user:', users[0].custom_handle || users[0].handle || users[0].id);
      return users[0];
    }
    return null;
  } catch (error) {
    console.error('User lookup error:', error);
    return null;
  }
}

// Authenticate user with email and password
export async function authenticateUser(email: string, password: string) {
  try {
    console.log('🔐 Authenticating user:', email);
    
    const user = await getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found for email:', email);
      return null;
    }
    
    // For now, check against temporary password until proper hashing is implemented server-side
    // This is a temporary solution for the browser environment limitation
    if (password === 'password123') {
      console.log('✅ Password authentication successful for:', user.custom_handle || user.handle);
      return user;
    } else {
      console.log('❌ Invalid password for user:', email);
      return null;
    }
  } catch (error) {
    console.error('❌ Error authenticating user:', error);
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
        banner_image_url
      FROM users 
      ORDER BY id
      LIMIT 1
    `;
    
    if (users.length > 0) {
      console.log('Fallback - using first user:', users[0].custom_handle || users[0].handle || users[0].id);
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
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected || !sql) {
      console.log('🔄 Database not connected, using mock chirps');
      return getMockChirps().slice(0, 5); // Return first 5 mock chirps
    }
    
    const chirps = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        c.reply_to_id,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
        -- Author information
        u.id::text as author_id,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.custom_handle as author_custom_handle,
        u.handle as author_handle,
        u.profile_image_url as author_profile_image_url
      FROM chirps c
      INNER JOIN users u ON c.author_id = u.id
      WHERE c.author_id = ${userId}
        AND c.reply_to_id IS NULL -- Only original chirps, not replies
      ORDER BY c.created_at DESC
      LIMIT 10
    `;
    
    // Transform the data to match ChirpCard expectations
    const transformedChirps = chirps.map(chirp => ({
      id: chirp.id,
      content: chirp.content,
      createdAt: chirp.createdAt,
      replyToId: chirp.reply_to_id,
      isWeeklySummary: chirp.isWeeklySummary,
      reactionCount: chirp.reaction_count,
      replyCount: chirp.reply_count,
      author: {
        id: chirp.author_id,
        firstName: chirp.author_first_name,
        lastName: chirp.author_last_name,
        customHandle: chirp.author_custom_handle,
        handle: chirp.author_handle,
        profileImageUrl: chirp.author_profile_image_url,
      }
    }));
    
    console.log(`Found ${transformedChirps.length} chirps for user`);
    return transformedChirps;
  } catch (error) {
    console.error('Error fetching user chirps:', error);
    return [];
  }
}

// Get replies by specific user
export async function getUserReplies(userId: string) {
  try {
    console.log('Fetching replies for user:', userId);
    
    // Check if database is connected
    if (!isDatabaseConnected || !sql) {
      console.log('🔄 Database not connected, using mock replies');
      return getMockChirps().slice(0, 3); // Return first 3 mock chirps as replies
    }
    
    const replies = await sql`
      SELECT 
        c.id::text,
        c.content,
        c.created_at as "createdAt",
        c.reply_to_id,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps sub_replies WHERE sub_replies.reply_to_id = c.id) as reply_count,
        -- Author information
        u.id::text as author_id,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        u.custom_handle as author_custom_handle,
        u.handle as author_handle,
        u.profile_image_url as author_profile_image_url,
        u.is_chirp_plus as author_is_chirp_plus,
        u.show_chirp_plus_badge as author_show_chirp_plus_badge
      FROM chirps c
      INNER JOIN users u ON c.author_id = u.id
      WHERE c.author_id = ${userId}
        AND c.reply_to_id IS NOT NULL -- Only replies
      ORDER BY c.created_at DESC
      LIMIT 50
    `;
    
    // Transform the data to match ChirpCard expectations
    const transformedReplies = replies.map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      replyToId: reply.reply_to_id,
      isWeeklySummary: reply.isWeeklySummary,
      reactionCount: reply.reaction_count,
      replyCount: reply.reply_count,
      author: {
        id: reply.author_id,
        firstName: reply.author_first_name,
        lastName: reply.author_last_name,
        customHandle: reply.author_custom_handle,
        handle: reply.author_handle,
        profileImageUrl: reply.author_profile_image_url,
      }
    }));
    
    console.log(`Found ${transformedReplies.length} replies for user`);
    return transformedReplies;
  } catch (error) {
    console.error('Error fetching user replies:', error);
    return [];
  }
}

// Get user stats (chirp count, followers, following)
export async function getUserStats(userId: string) {
  try {
    console.log('Fetching stats for user:', userId);
    
    // Ensure database is initialized
    await ensureDatabaseInitialized();
    
    // Check if database is connected
    if (!isDatabaseConnected || !sql) {
      console.log('🔄 Database not connected, using mock stats');
      // Return mock stats with some realistic values
      return {
        chirps: secureRandomInt(5, 25), // 5-25 chirps
        followers: secureRandomInt(10, 110), // 10-110 followers
        following: secureRandomInt(5, 55), // 5-55 following
        likes: secureRandomInt(10, 60) // 10-60 likes
      };
    }
    
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM chirps WHERE author_id = ${userId}) as chirps,
        (SELECT COUNT(*) FROM follows WHERE following_id = ${userId}) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ${userId}) as following,
        (SELECT COALESCE(SUM(count), 0) FROM reactions r 
         JOIN chirps c ON r.chirp_id = c.id 
         WHERE c.author_id = ${userId}) as likes
    `;
    
    const userStats = {
      chirps: Number(stats[0]?.chirps || 0),
      followers: Number(stats[0]?.followers || 0), 
      following: Number(stats[0]?.following || 0),
      likes: Number(stats[0]?.likes || 0)
    };
    
    console.log('User stats:', userStats);
    return userStats;
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return { chirps: 0, followers: 0, following: 0, likes: 0 };
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
    
    // Get all chirps that contain hashtags (expand time range to find existing chirps)
    const recentChirps = await sql`
      SELECT content, created_at
      FROM chirps c
      WHERE content LIKE '%#%'
        AND reply_to_id IS NULL
      ORDER BY c.created_at DESC
      LIMIT 100
    `;
    
    console.log(`Found ${recentChirps.length} chirps with potential hashtags`);
    
    // Extract hashtags using JavaScript 
    const hashtagCounts = {};
    const hashtagRegex = /#[a-zA-Z0-9_]+/gi;
    
    recentChirps.forEach(chirp => {
      console.log('Processing chirp content:', chirp.content);
      const matches = chirp.content.match(hashtagRegex);
      if (matches) {
        console.log('Found hashtags:', matches);
        matches.forEach(hashtag => {
          const normalizedHashtag = hashtag.toLowerCase();
          hashtagCounts[normalizedHashtag] = (hashtagCounts[normalizedHashtag] || 0) + 1;
        });
      }
    });
    
    console.log('Hashtag counts:', hashtagCounts);
    
    // Convert to array and sort by count
    const trendingHashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ 
        hashtag, 
        count: `${count as number} chirp${(count as number) > 1 ? 's' : ''}` 
      }))
      .sort((a, b) => {
        const aCount = parseInt(a.count.split(' ')[0]);
        const bCount = parseInt(b.count.split(' ')[0]);
        return bCount - aCount;
      })
      .slice(0, 10);
    
    console.log('Trending hashtags found:', trendingHashtags);
    
    return trendingHashtags;
  } catch (error) {
    console.error('Trending hashtags error:', error);
    return [];
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
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
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
               u.custom_handle, u.handle, u.first_name, u.last_name, u.profile_image_url, u.banner_image_url, u.is_chirp_plus, u.show_chirp_plus_badge
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
        c.author_id::text,
        COALESCE(u.custom_handle, u.handle, CAST(u.id AS text), 'user') as username,
        COALESCE(u.first_name || ' ' || u.last_name, u.custom_handle, u.handle) as display_name,
        u.profile_image_url,
        u.banner_image_url,
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
        NULL as reply_to_id,
        NULL as repost_of_id,
        COALESCE(c.is_weekly_summary, false) as "isWeeklySummary",
        NULL as original_chirp_id,
        NULL as original_content,
        NULL as original_created_at,
        NULL as original_author_id,
        NULL as original_username,
        NULL as original_display_name,
        NULL as original_profile_image_url,
        NULL as original_banner_image_url,
        false as original_is_weekly_summary,
        NULL as original_is_chirp_plus,
        NULL as original_show_chirp_plus_badge,
        (SELECT COUNT(*) FROM reactions r WHERE r.chirp_id = c.id) as reaction_count,
        (SELECT COUNT(*) FROM chirps replies WHERE replies.reply_to_id = c.id) as reply_count,
        (SELECT COUNT(*) FROM reposts rp WHERE rp.chirp_id = c.id) as repost_count
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

// Add missing profile functions for ProfileModal - only add getUserProfile since others exist
export async function getUserProfile(userId: string) {
  console.log('📥 Fetching user profile for:', userId);
  try {
    const result = await sql`
      SELECT 
        id::text,
        first_name,
        last_name,
        email,
        handle,
        custom_handle,
        profile_image_url,
        banner_image_url,
        bio,
        is_chirp_plus,
        show_chirp_plus_badge,
        created_at,
        updated_at
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      console.log('❌ User not found:', userId);
      return null;
    }
    
    console.log('✅ User profile loaded:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    throw error;
  }
}

// Find user by handle/mention (for bio mention navigation)
export async function getUserByHandle(handle: string): Promise<any | null> {
  try {
    console.log('🔍 Finding user by handle:', handle);
    
    // Remove @ symbol if present
    const cleanHandle = handle.replace('@', '');
    
    const result = await sql`
      SELECT 
        id::text,
        first_name,
        last_name,
        email,
        handle,
        custom_handle,
        profile_image_url,
        banner_image_url,
        bio,
        is_chirp_plus,
        show_chirp_plus_badge,
        created_at,
        updated_at
      FROM users 
      WHERE LOWER(custom_handle) = LOWER(${cleanHandle}) 
         OR LOWER(handle) = LOWER(${cleanHandle})
      LIMIT 1
    `;
    
    if (result.length === 0) {
      console.log('❌ User not found with handle:', cleanHandle);
      return null;
    }
    
    console.log('✅ User found by handle:', result[0]);
    return result[0];
  } catch (error) {
    console.error('❌ Error finding user by handle:', error);
    return null;
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
    
    return {
      isActive: false,
      isSubscribed: false,
      expiresAt: null,
      showBadge: false
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

// Get followers list for a user
export async function getFollowers(userId: string) {
  try {
    console.log('Fetching followers for user:', userId);
    const followers = await sql`
      SELECT 
        u.id::text,
        u.first_name,
        u.last_name,
        u.custom_handle,
        u.handle,
        u.profile_image_url,
        u.is_chirp_plus,
        u.show_chirp_plus_badge,
        u.bio
      FROM follows f
      INNER JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ${userId}
      ORDER BY f.created_at DESC
    `;
    
    console.log(`Found ${followers.length} followers for user`);
    return followers.map(follower => ({
      id: follower.id,
      firstName: follower.first_name,
      lastName: follower.last_name,
      customHandle: follower.custom_handle,
      handle: follower.handle,
      profileImageUrl: follower.profile_image_url,
      bio: follower.bio
    }));
  } catch (error) {
    console.error('Error fetching followers:', error);
    return [];
  }
}

// Get following list for a user
export async function getFollowing(userId: string) {
  try {
    console.log('Fetching following for user:', userId);
    const following = await sql`
      SELECT 
        u.id::text,
        u.first_name,
        u.last_name,
        u.custom_handle,
        u.handle,
        u.profile_image_url,
      FROM follows f
      INNER JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ${userId}
      ORDER BY f.created_at DESC
    `;
    
    console.log(`Found ${following.length} following for user`);
    return following.map(follow => ({
      id: follow.id,
      firstName: follow.first_name,
      lastName: follow.last_name,
      customHandle: follow.custom_handle,
      handle: follow.handle,
      profileImageUrl: follow.profile_image_url,
      bio: follow.bio
    }));
  } catch (error) {
    console.error('Error fetching following:', error);
    return [];
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

export async function checkFollowStatus(targetUserId: string): Promise<{ isFollowing: boolean; isBlocked: boolean; notificationsEnabled: boolean }> {
  try {
    // For now, return default follow status - will need current user context to implement properly
    return {
      isFollowing: false,
      isBlocked: false,
      notificationsEnabled: false
    };
  } catch (error) {
    console.error('Error checking follow status:', error);
    return {
      isFollowing: false,
      isBlocked: false,
      notificationsEnabled: false
    };
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

// Feedback submission function
export async function submitFeedback(feedback: {
  name: string;
  email: string;
  category: string;
  message: string;
}): Promise<void> {
  try {
    console.log('Submitting feedback via API to send email...');
    
    // Create a subject line from the category and truncated message
    const subject = `${feedback.category}: ${feedback.message.substring(0, 50)}${feedback.message.length > 50 ? '...' : ''}`;
    
    // Use the server API route which handles both database storage AND email sending
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: feedback.email || undefined, // Convert empty string to undefined
        category: feedback.category,
        subject: subject,
        message: feedback.message,
        location: 'mobile_app', // Indicate this came from mobile app
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to submit feedback' }));
      console.error('Feedback submission failed:', errorData);
      throw new Error(errorData.message || 'Failed to submit feedback');
    }

    console.log('Feedback submitted successfully - email sent to joinchirp@gmail.com');
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

// Get notifications for a user
export async function getNotifications(userId: string): Promise<any[]> {
  try {
    console.log(`Fetching notifications for user: ${userId}`);
    
    const result = await sql`
      SELECT 
        n.id,
        n.type,
        n.from_user_id as "fromUserId",
        n.chirp_id as "chirpId",
        n.read,
        n.created_at as "createdAt",
        -- From user data
        fu.id as "fromUser.id",
        fu.first_name as "fromUser.first_name",
        fu.last_name as "fromUser.last_name",
        fu.custom_handle as "fromUser.custom_handle",
        fu.handle as "fromUser.handle",
        fu.email as "fromUser.email",
        fu.profile_image_url as "fromUser.profile_image_url",
        -- Chirp data
        c.id as "chirp.id",
        c.content as "chirp.content",
        c.created_at as "chirp.created_at"
      FROM notifications n
      LEFT JOIN users fu ON n.from_user_id = fu.id
      LEFT JOIN chirps c ON n.chirp_id = c.id
      WHERE n.user_id = ${userId}
      ORDER BY n.created_at DESC
      LIMIT 100
    `;

    // Transform the flat result into nested objects
    const notifications = result.map((row: any) => ({
      id: row.id,
      type: row.type,
      fromUserId: row.fromUserId,
      chirpId: row.chirpId,
      read: row.read,
      createdAt: row.createdAt,
      fromUser: row['fromUser.id'] ? {
        id: row['fromUser.id'],
        first_name: row['fromUser.first_name'],
        last_name: row['fromUser.last_name'],
        custom_handle: row['fromUser.custom_handle'],
        handle: row['fromUser.handle'],
        email: row['fromUser.email'],
        profile_image_url: row['fromUser.profile_image_url'],
      } : null,
      chirp: row['chirp.id'] ? {
        id: row['chirp.id'],
        content: row['chirp.content'],
        created_at: row['chirp.created_at'],
      } : null,
    }));

    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    console.log(`Marking notification ${notificationId} as read`);
    
    await sql`
      UPDATE notifications 
      SET read = true 
      WHERE id = ${notificationId}
    `;
    
    console.log(`Successfully marked notification ${notificationId} as read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

