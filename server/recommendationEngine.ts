import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { chirps, follows, reactions, users } from "../shared/schema";
import { db } from "./db";
import { storage } from "./storage";

interface UserEngagementProfile {
  userId: string;
  recentChirpKeywords: string[];
  frequentReactionEmojis: string[];
  engagedWithUsers: string[];
  topicInterests: string[];
  engagementTime: Date[];
}

interface ChirpScore {
  chirpId: number;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  private readonly KEYWORD_WEIGHT = 0.3;
  private readonly AUTHOR_WEIGHT = 0.25;
  private readonly REACTION_WEIGHT = 0.2;
  private readonly RECENCY_WEIGHT = 0.15;
  private readonly FOLLOWING_WEIGHT = 0.1;

  async getPersonalizedFeed(userId: string, limit = 20): Promise<any[]> {
    // Build user engagement profile
    const profile = await this.buildUserProfile(userId);
    
    // Get candidate chirps (exclude user's own chirps)
    const candidateChirps = await this.getCandidateChirps(userId);
    
    // Score each chirp
    const scoredChirps = await Promise.all(
      candidateChirps.map(chirp => this.scoreChirp(chirp, profile))
    );
    
    // Sort by score and return top results
    const topChirps = scoredChirps
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Fetch full chirp data with reactions and author info
    const chirpIds = topChirps.map(item => item.chirpId);
    
    if (chirpIds.length === 0) {
      // Fallback to recent chirps if no personalized results
      return await this.getFallbackFeed(userId, limit);
    }

    const fullChirps = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(inArray(chirps.id, chirpIds))
      .orderBy(desc(chirps.createdAt));

    // Add reaction counts and user reactions
    const enrichedChirps = await this.enrichChirpsWithReactions(fullChirps, userId);
    
    // Sort by recommendation score
    return enrichedChirps.sort((a, b) => {
      const scoreA = topChirps.find(s => s.chirpId === a.id)?.score || 0;
      const scoreB = topChirps.find(s => s.chirpId === b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }

  private async buildUserProfile(userId: string): Promise<UserEngagementProfile> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get user's recent chirps for content analysis
    const userChirps = await db
      .select({ content: chirps.content })
      .from(chirps)
      .where(and(
        eq(chirps.authorId, userId),
        sql`${chirps.createdAt} > ${thirtyDaysAgo.toISOString()}`
      ))
      .limit(50);

    // Get user's frequent reactions
    const userReactions = await db
      .select({
        emoji: reactions.emoji,
        count: sql<number>`count(*)`.as('count')
      })
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        sql`${reactions.createdAt} > ${thirtyDaysAgo.toISOString()}`
      ))
      .groupBy(reactions.emoji)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    // Get users they frequently engage with
    const engagedAuthors = await db
      .select({
        authorId: chirps.authorId,
        count: sql<number>`count(*)`.as('count')
      })
      .from(reactions)
      .innerJoin(chirps, eq(reactions.chirpId, chirps.id))
      .where(and(
        eq(reactions.userId, userId),
        ne(chirps.authorId, userId), // Exclude self
        sql`${reactions.createdAt} > ${thirtyDaysAgo.toISOString()}`
      ))
      .groupBy(chirps.authorId)
      .orderBy(desc(sql`count(*)`))
      .limit(20);

    return {
      userId,
      recentChirpKeywords: this.extractKeywords(userChirps.map(c => c.content)),
      frequentReactionEmojis: userReactions.map(r => r.emoji),
      engagedWithUsers: engagedAuthors.map(a => a.authorId),
      topicInterests: [], // Could be enhanced with NLP
      engagementTime: [], // Could track when user is most active
    };
  }

  private async getCandidateChirps(userId: string): Promise<any[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get recent chirps excluding user's own
    const candidates = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(and(
        ne(chirps.authorId, userId),
        sql`${chirps.createdAt} > ${sevenDaysAgo.toISOString()}`,
        eq(chirps.repostOfId, null) // Exclude reposts for now
      ))
      .orderBy(desc(chirps.createdAt))
      .limit(200); // Get larger pool to score

    return candidates.map(c => ({ ...c.chirp, author: c.author }));
  }

  private async scoreChirp(chirp: any, profile: UserEngagementProfile): Promise<ChirpScore> {
    let score = 0;
    const reasons: string[] = [];

    // Content similarity scoring
    const contentKeywords = this.extractKeywords([chirp.content]);
    const keywordOverlap = this.calculateKeywordOverlap(profile.recentChirpKeywords, contentKeywords);
    if (keywordOverlap > 0) {
      score += keywordOverlap * this.KEYWORD_WEIGHT;
      reasons.push(`Content similarity (${Math.round(keywordOverlap * 100)}%)`);
    }

    // Author engagement scoring
    if (profile.engagedWithUsers.includes(chirp.authorId)) {
      score += this.AUTHOR_WEIGHT;
      reasons.push("Author you engage with");
    }

    // Following relationship scoring
    const isFollowing = await this.checkFollowingRelationship(profile.userId, chirp.authorId);
    if (isFollowing) {
      score += this.FOLLOWING_WEIGHT;
      reasons.push("Following author");
    }

    // Recency scoring (newer chirps get higher scores)
    const hoursOld = (Date.now() - new Date(chirp.createdAt).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - (hoursOld / 168)); // Decay over a week
    score += recencyScore * this.RECENCY_WEIGHT;
    if (recencyScore > 0.7) {
      reasons.push("Recent post");
    }

    // Reaction pattern scoring
    const chirpReactions = await this.getChirpReactions(chirp.id);
    for (const emoji of profile.frequentReactionEmojis) {
      if (chirpReactions.includes(emoji)) {
        score += this.REACTION_WEIGHT * 0.5;
        reasons.push(`Popular with ${emoji} reactions`);
        break;
      }
    }

    return {
      chirpId: chirp.id,
      score: Math.min(1, score), // Cap at 1.0
      reasons
    };
  }

  private async getFallbackFeed(userId: string, limit: number): Promise<any[]> {
    // Simple fallback: recent chirps from followed users + popular recent chirps
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const followingIds = followedUsers.map(f => f.followingId);

    if (followingIds.length > 0) {
      const results = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(and(
          inArray(chirps.authorId, followingIds),
          ne(chirps.authorId, userId)
        ))
        .orderBy(desc(chirps.createdAt))
        .limit(limit);

      return await this.enrichChirpsWithReactions(results, userId);
    }

    // Ultimate fallback: recent popular chirps
    return await storage.getChirps(userId, limit);
  }

  private async enrichChirpsWithReactions(chirps: any[], userId: string): Promise<any[]> {
    if (chirps.length === 0) return [];

    const chirpIds = chirps.map(c => c.chirp?.id || c.id);
    
    // Get reaction counts
    const reactionCounts = await db
      .select({
        chirpId: reactions.chirpId,
        emoji: reactions.emoji,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(reactions)
      .where(inArray(reactions.chirpId, chirpIds))
      .groupBy(reactions.chirpId, reactions.emoji);

    // Get user's reactions
    const userReactions = await db
      .select({
        chirpId: reactions.chirpId,
        emoji: reactions.emoji,
      })
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        inArray(reactions.chirpId, chirpIds)
      ));

    return chirps.map(item => {
      const chirp = item.chirp || item;
      const author = item.author;
      
      const chirpReactionCounts = reactionCounts.filter(r => r.chirpId === chirp.id);
      const reactionCountsMap: Record<string, number> = {};
      chirpReactionCounts.forEach(r => {
        reactionCountsMap[r.emoji] = r.count;
      });

      const userReaction = userReactions.find(r => r.chirpId === chirp.id)?.emoji;

      return {
        ...chirp,
        author: author || chirp.author,
        reactionCounts: reactionCountsMap,
        userReaction,
      };
    });
  }

  private extractKeywords(texts: string[]): string[] {
    const allText = texts.join(' ').toLowerCase();
    const words = allText.match(/\b\w{3,}\b/g) || [];
    
    // Simple keyword extraction (could be enhanced with NLP)
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      if (!this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    return intersection.size / Math.max(set1.size, set2.size);
  }

  private async checkFollowingRelationship(userId: string, authorId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(and(
        eq(follows.followerId, userId),
        eq(follows.followingId, authorId)
      ))
      .limit(1);
    
    return !!result;
  }

  private async getChirpReactions(chirpId: number): Promise<string[]> {
    const reactions = await db
      .select({ emoji: reactions.emoji })
      .from(reactions)
      .where(eq(reactions.chirpId, chirpId));
    
    return reactions.map(r => r.emoji);
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
      'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must'
    ]);
    return stopWords.has(word);
  }
}

export const recommendationEngine = new RecommendationEngine();