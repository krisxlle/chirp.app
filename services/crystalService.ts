import { awardCrystals, deductCrystalBalance, getUserCrystalBalance } from '../lib/database/mobile-db-supabase';

export class CrystalService {
  static async awardLikeCrystals(userId: string, chirpId: string): Promise<void> {
    try {
      await awardCrystals(userId, 1, 'like');
      console.log(`💎 Awarded 1 crystal for like to user: ${userId.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Error awarding like crystals:', error);
    }
  }

  static async awardCommentCrystals(userId: string, chirpId: string): Promise<void> {
    try {
      await awardCrystals(userId, 2, 'comment');
      console.log(`💎 Awarded 2 crystals for comment to user: ${userId.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Error awarding comment crystals:', error);
    }
  }

  static async getCrystalBalance(userId: string): Promise<number> {
    try {
      return await getUserCrystalBalance(userId);
    } catch (error) {
      console.error('❌ Error fetching crystal balance:', error);
      return 0;
    }
  }

  static async spendCrystals(userId: string, amount: number): Promise<boolean> {
    try {
      return await deductCrystalBalance(userId, amount);
    } catch (error) {
      console.error('❌ Error spending crystals:', error);
      return false;
    }
  }
}
