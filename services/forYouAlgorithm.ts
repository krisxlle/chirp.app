import { supabase } from '../mobile-db-supabase';

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
  includeReplies?: boolean;
  prioritizeFollowed?: boolean;
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

  /**
   * Get personalized "For You" feed for a user
   */
  static async getForYouFeed(options: ForYouAlgorithmOptions): Promise<Chirp[]> {
    const {
      userId,
      limit = this.DEFAULT_LIMIT,
      includeReplies = false,
      prioritizeFollowed = true
    } = options;

    try {
      console.log('🎯 For You Algorithm: Starting personalized feed generation');
      console.log('🎯 User ID:', userId, 'Limit:', limit, 'Prioritize Followed:', prioritizeFollowed);

      // Step 1: Get user's following list
      const followingIds = prioritizeFollowed ? await this.getFollowingIds(userId) : [];
      console.log('🎯 Following count:', followingIds.length);

      // Step 2: Fetch chirps with engagement data
      const chirps = await this.fetchChirpsWithEngagement(includeReplies, limit * 2); // Fetch more for better ranking
      console.log('🎯 Raw chirps fetched:', chirps.length);

      // Step 3: Apply personalized ranking algorithm
      const rankedChirps = await this.rankChirps(chirps, userId, followingIds);
      console.log('🎯 Chirps after ranking:', rankedChirps.length);

      // Step 4: Return top results
      const finalResults = rankedChirps.slice(0, limit);
      console.log('🎯 Final For You feed:', finalResults.length, 'chirps');

      return finalResults;
    } catch (error) {
      console.error('❌ For You Algorithm Error:', error);
      return [];
    }
  }

  /**
   * Get list of user IDs that the current user follows
   */
  private static async getFollowingIds(userId: string): Promise<string[]> {
    try {
      const { data: follows, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      if (error) {
        console.error('❌ Error fetching following list:', error);
        return [];
      }

      return follows?.map(f => f.following_id) || [];
    } catch (error) {
      console.error('❌ Error in getFollowingIds:', error);
      return [];
    }
  }

  /**
   * Fetch chirps with engagement metrics
   */
  private static async fetchChirpsWithEngagement(includeReplies: boolean, limit: number): Promise<Chirp[]> {
    try {
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
        .limit(limit);

      // Filter out replies if not including them
      if (!includeReplies) {
        query.is('reply_to_id', null);
      }

      const { data: chirps, error } = await query;

      if (error) {
        console.error('❌ Error fetching chirps:', error);
        return [];
      }

      // Transform and add engagement data
      const transformedChirps = await Promise.all((chirps || []).map(async (chirp: any) => {
        // Get engagement metrics
        const [reactionCount, replyCount] = await Promise.all([
          this.getReactionCount(chirp.id),
          this.getReplyCount(chirp.id)
        ]);

        return {
          id: chirp.id.toString(),
          content: chirp.content,
          createdAt: chirp.created_at,
          replyToId: chirp.reply_to_id,
          isWeeklySummary: chirp.is_weekly_summary || false,
          reactionCount,
          replyCount,
          reactions: [],
          replies: [],
          repostOfId: null,
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
        };
      }));

      return transformedChirps;
    } catch (error) {
      console.error('❌ Error in fetchChirpsWithEngagement:', error);
      return [];
    }
  }

  /**
   * Get reaction count for a chirp
   */
  private static async getReactionCount(chirpId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('chirp_id', chirpId);

      return error ? 0 : (count || 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get reply count for a chirp
   */
  private static async getReplyCount(chirpId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('chirps')
        .select('*', { count: 'exact', head: true })
        .eq('reply_to_id', chirpId);

      return error ? 0 : (count || 0);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Rank chirps using personalized algorithm
   */
  private static async rankChirps(chirps: Chirp[], userId: string, followingIds: string[]): Promise<Chirp[]> {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

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
        repostOfId: null,
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
