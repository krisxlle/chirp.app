// Utility function to determine user rarity based on user data
export const determineUserRarity = (user: {
  id: string;
  handle?: string;
  firstName?: string;
  customHandle?: string;
}): 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' => {
  if (!user) return 'common';
  
  const userHandle = (user.handle || '').toLowerCase();
  const userName = (user.firstName || user.customHandle || '').toLowerCase();
  
  // Bot detection with hardcoded rarities
  if (userHandle.includes('crimsontalon') || userName.includes('crimsontalon')) {
    return 'mythic';
  } else if (userHandle.includes('solarius') || userName.includes('solarius')) {
    return 'legendary';
  } else if (userHandle.includes('prisma') || userName.includes('prisma')) {
    return 'epic';
  } else if (userHandle.includes('skye') || userName.includes('skye')) {
    return 'rare';
  } else if (userHandle.includes('thorne') || userName.includes('thorne')) {
    return 'uncommon';
  } else if (userHandle.includes('obsidian') || userName.includes('obsidian')) {
    return 'common';
  }
  
  // For regular users, we need a consistent way to determine rarity
  // We'll use a hash of the user ID to ensure consistency
  const userId = user.id;
  const hash = userId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const rarityRoll = Math.abs(hash) % 100;
  
  if (rarityRoll < 1) return 'mythic';      // 1%
  else if (rarityRoll < 5) return 'legendary';  // 4%
  else if (rarityRoll < 15) return 'epic';      // 10%
  else if (rarityRoll < 35) return 'rare';      // 20%
  else if (rarityRoll < 65) return 'uncommon';  // 30%
  else return 'common';                           // 35%
};
