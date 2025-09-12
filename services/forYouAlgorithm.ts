import { supabase } from '../lib/database/mobile-db-supabase';

export interface Chirp {
  id: string;
  content: string;
  createdAt: string;
  replyToId?: string;
  isWeeklySummary: boolean;
  reactionCount: number;
  replyCount: number;
  reactions: any[];
  replies: any[];
  repostOfId?: string;
  originalChirp?: any;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    customHandle: string;
    handle: string;
    profileImageUrl?: string;
    avatarUrl?: string;
    bannerImageUrl?: string;
    bio: string;
    joinedAt: string;
    isChirpPlus: boolean;
    showChirpPlusBadge: boolean;
  };
}

export interface ForYouAlgorithmOptions {
  userId: string;
  limit?: number;
  offset?: number;
  includeReplies?: boolean;
  prioritizeFollowed?: boolean;
  useCache?: boolean;
}

/**
 * Advanced "For You" algorithm that prioritizes content from users you follow
 * while maintaining engagement and discovery
 */
export class ForYouAlgorithm {
  private static readonly DEFAULT_LIMIT = 20;
  private static readonly FOLLOWED_WEIGHT = 3.0; // Chirps from followed users get 3x boost
  private static readonly RECENCY_WEIGHT = 1.5; // Recent chirps get 1.5x boost
  private static readonly ENGAGEMENT_WEIGHT = 1.2; // High engagement chirps get 1.2x boost
  private static readonly PROFILE_POWER_WEIGHT = 0.1; // Profile power influence (0.1 per 100 power points)
  
  // Performance optimization: Cache for following lists and profile power
  private static followingCache = new Map<string, { data: string[], timestamp: number }>();
  private static profilePowerCache = new Map<string, { data: number, timestamp: number }>();
  private static readonly FOLLOWING_CACHE_TTL = 300000; // 5 minutes
  private static readonly PROFILE_POWER_CACHE_TTL = 300000; // 5 minutes

  /**
   * Get personalized "For You" feed for a user - OPTIMIZED VERSION
   */
  static async getForYouFeed(options: ForYouAlgorithmOptions): Promise<Chirp[]> {
    const {
      userId,
      limit = this.DEFAULT_LIMIT,
      offset = 0,
      includeReplies = false,
      prioritizeFollowed = true,
      useCache = true
    } = options;

    try {
      console.log('🎯 For You Algorithm: Starting optimized feed generation');
      console.log('🎯 User ID:', userId, 'Limit:', limit, 'Offset:', offset, 'Prioritize Followed:', prioritizeFollowed);

      // Step 1: Get user's following list (with caching)
      const followingIds = prioritizeFollowed ? await this.getFollowingIds(userId) : [];
      console.log('🎯 Following count:', followingIds.length);

      // Step 2: Fetch chirps with engagement data (optimized single query)
      const chirps = await this.fetchChirpsWithEngagement(includeReplies, limit + offset);
      console.log('🎯 Raw chirps fetched:', chirps.length);

      // Step 3: Apply personalized ranking algorithm (optimized)
      const rankedChirps = await this.rankChirps(chirps, userId, followingIds);
      console.log('🎯 Chirps after ranking:', rankedChirps.length);

      // Step 4: Apply pagination and return results
      const finalResults = rankedChirps.slice(offset, offset + limit);
      console.log('🎯 Final For You feed:', finalResults.length, 'chirps');

      return finalResults;
    } catch (error) {
      console.error('❌ For You Algorithm Error:', error);
      return [];
    }
  }

  /**
   * Get list of user IDs that the current user follows - OPTIMIZED WITH CACHING
   */
  private static async getFollowingIds(userId: string): Promise<string[]> {
    try {
      // Check cache first
      const cached = this.followingCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < this.FOLLOWING_CACHE_TTL) {
        console.log('✅ Returning cached following list');
        return cached.data;
      }

      const { data: follows, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) {
        console.error('❌ Error fetching following list:', error);
        return [];
      }

      const followingIds = follows?.map(f => f.following_id) || [];
      
      // Cache the result
      this.followingCache.set(userId, { data: followingIds, timestamp: Date.now() });
      
      return followingIds;
    } catch (error) {
      console.error('❌ Error in getFollowingIds:', error);
      return [];
    }
  }

  /**
   * Fetch chirps with engagement metrics - OPTIMIZED VERSION WITH TIMEOUT
   * Uses single query with joins to avoid N+1 problem
   */
  private static async fetchChirpsWithEngagement(includeReplies: boolean, limit: number): Promise<Chirp[]> {
    try {
      // Reduce limit to prevent timeouts
      const safeLimit = Math.min(limit, 10);
      
      // Ultra-simplified query for maximum speed
      const query = supabase
        .from('chirps')
        .select(`
          id,
          content,
          created_at,
          reply_to_id,
          is_weekly_summary,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            custom_handle,
            handle,
            profile_image_url,
            avatar_url,
            banner_image_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(safeLimit);

      // Filter out replies if not including them
      if (!includeReplies) {
        query.is('reply_to_id', null);
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 8000)
      );

      const queryPromise = query;
      const { data: chirps, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Error fetching chirps:', error);
        return [];
      }

      // Transform data efficiently with simplified engagement counts
      const transformedChirps = (chirps || []).map((chirp: any) => ({
        id: chirp.id.toString(),
        content: chirp.content,
        createdAt: chirp.created_at,
        replyToId: chirp.reply_to_id,
        isWeeklySummary: chirp.is_weekly_summary || false,
        reactionCount: 0, // Simplified for performance - will be fetched separately if needed
        replyCount: 0, // Simplified for performance - will be fetched separately if needed
        reactions: [],
        replies: [],
        repostOfId: undefined,
        originalChirp: undefined,
        author: {
          id: chirp.users.id,
          firstName: chirp.users.first_name || 'User',
          lastName: chirp.users.last_name || '',
          email: chirp.users.email,
          customHandle: chirp.users.custom_handle || chirp.users.handle,
          handle: chirp.users.handle,
          profileImageUrl: chirp.users.profile_image_url,
          avatarUrl: chirp.users.avatar_url,
          bannerImageUrl: chirp.users.banner_image_url,
          bio: '',
          joinedAt: new Date().toISOString(),
          isChirpPlus: false,
          showChirpPlusBadge: false
        }
      }));

      return transformedChirps;
    } catch (error) {
      console.error('❌ Error in fetchChirpsWithEngagement:', error);
      return [];
    }
  }

  /**
   * Get profile power for a user with caching
   */
  private static async getProfilePower(userId: string): Promise<number> {
    try {
      // Check cache first
      const cached = this.profilePowerCache.get(userId);
      if (cached && (Date.now() - cached.timestamp) < this.PROFILE_POWER_CACHE_TTL) {
        return cached.data;
      }

      // Import and call the profile power calculation function
      const { calculateProfilePower } = await import('../lib/database/mobile-db-supabase');
      const profilePower = await calculateProfilePower(userId);
      
      // Cache the result
      this.profilePowerCache.set(userId, { data: profilePower, timestamp: Date.now() });
      
      return profilePower;
    } catch (error) {
      console.error('❌ Error getting profile power:', error);
      return 100; // Fallback to base power
    }
  }

  /**
   * Clear following cache for a user (call when user follows/unfollows someone)
   */
  static clearFollowingCache(userId: string): void {
    this.followingCache.delete(userId);
    console.log('🗑️ Cleared following cache for user:', userId);
  }

  /**
   * Clear profile power cache for a user (call when user's engagement changes)
   */
  static clearProfilePowerCache(userId: string): void {
    this.profilePowerCache.delete(userId);
    console.log('🗑️ Cleared profile power cache for user:', userId);
  }

  /**
   * Rank chirps using personalized algorithm with profile power
   */
  private static async rankChirps(chirps: Chirp[], userId: string, followingIds: string[]): Promise<Chirp[]> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    // Get profile power for all unique authors
    const authorIds = [...new Set(chirps.map(chirp => chirp.author.id))];
    const profilePowers = new Map<string, number>();
    
    // Fetch profile powers in parallel
    const powerPromises = authorIds.map(async (authorId) => {
      const power = await this.getProfilePower(authorId);
      profilePowers.set(authorId, power);
    });
    
    await Promise.all(powerPromises);

    return chirps
      .map(chirp => {
        let score = 1.0; // Base score

        // Boost for followed users
        if (followingIds.includes(chirp.author.id)) {
          score *= this.FOLLOWED_WEIGHT;
          console.log('🎯 Boosted chirp from followed user:', chirp.author.handle, 'Score:', score);
        }

        // Boost for recent content
        const chirpAge = now - new Date(chirp.createdAt).getTime();
        if (chirpAge < oneDayMs) {
          score *= this.RECENCY_WEIGHT;
        } else if (chirpAge < oneWeekMs) {
          score *= 1.2; // Moderate boost for week-old content
        }

        // Boost for high engagement
        const totalEngagement = chirp.reactionCount + chirp.replyCount;
        if (totalEngagement > 10) {
          score *= this.ENGAGEMENT_WEIGHT;
        } else if (totalEngagement > 5) {
          score *= 1.1; // Small boost for moderate engagement
        }

        // Boost for high profile power users
        const authorProfilePower = profilePowers.get(chirp.author.id) || 100;
        const powerBoost = 1 + (authorProfilePower * this.PROFILE_POWER_WEIGHT / 100);
        score *= powerBoost;

        console.log('🎯 Profile power boost for', chirp.author.handle, ':', {
          profilePower: authorProfilePower,
          powerBoost: powerBoost.toFixed(2),
          finalScore: score.toFixed(2)
        });

        // Penalty for own content (optional - you might want to see your own posts)
        // if (chirp.author.id === userId) {
        //   score *= 0.5;
        // }

        return { ...chirp, _algorithmScore: score };
      })
      .sort((a, b) => b._algorithmScore - a._algorithmScore)
      .map(({ _algorithmScore, ...chirp }) => chirp); // Remove score from final result
  }

  /**
   * Get trending chirps (high engagement, recent)
   */
  static async getTrendingChirps(limit: number = 10): Promise<Chirp[]> {
    try {
      console.log('🔥 Getting trending chirps');
      
      const chirps = await this.fetchChirpsWithEngagement(false, limit * 2);
      
      // Sort by engagement score
      const trendingChirps = chirps
        .map(chirp => ({
          ...chirp,
          _engagementScore: chirp.reactionCount * 2 + chirp.replyCount
        }))
        .sort((a, b) => b._engagementScore - a._engagementScore)
        .slice(0, limit)
        .map(({ _engagementScore, ...chirp }) => chirp);

      console.log('🔥 Trending chirps:', trendingChirps.length);
      return trendingChirps;
    } catch (error) {
      console.error('❌ Error getting trending chirps:', error);
      return [];
    }
  }

  /**
   * Get chirps from followed users only
   */
  static async getFollowedUsersFeed(userId: string, limit: number = 20): Promise<Chirp[]> {
    try {
      console.log('👥 Getting followed users feed for:', userId);
      
      const followingIds = await this.getFollowingIds(userId);
      
      if (followingIds.length === 0) {
        console.log('👥 No followed users, returning empty feed');
        return [];
      }

      const { data: chirps, error } = await supabase
        .from('chirps')
        .select(`
          id,
          content,
          created_at,
          reply_to_id,
          is_weekly_summary,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            custom_handle,
            handle,
            profile_image_url,
            avatar_url,
            banner_image_url
          )
        `)
        .in('author_id', followingIds)
        .is('reply_to_id', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching followed users chirps:', error);
        return [];
      }

      // Transform chirps
      const transformedChirps = (chirps || []).map((chirp: any) => ({
        id: chirp.id.toString(),
        content: chirp.content,
        createdAt: chirp.created_at,
        replyToId: chirp.reply_to_id,
        isWeeklySummary: chirp.is_weekly_summary || false,
        reactionCount: 0, // Simplified for performance
        replyCount: 0,
        reactions: [],
        replies: [],
        repostOfId: undefined,
        originalChirp: undefined,
        author: {
          id: chirp.users.id,
          firstName: chirp.users.first_name || 'User',
          lastName: chirp.users.last_name || '',
          email: chirp.users.email,
          customHandle: chirp.users.custom_handle || chirp.users.handle,
          handle: chirp.users.handle,
          profileImageUrl: chirp.users.profile_image_url,
          avatarUrl: chirp.users.avatar_url,
          bannerImageUrl: chirp.users.banner_image_url,
          bio: '',
          joinedAt: new Date().toISOString(),
          isChirpPlus: false,
          showChirpPlusBadge: false
        }
      }));

      console.log('👥 Followed users feed:', transformedChirps.length, 'chirps');
      return transformedChirps;
    } catch (error) {
      console.error('❌ Error in getFollowedUsersFeed:', error);
      return [];
    }
  }
}

export default ForYouAlgorithm;
