import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';

// Profile Frame Gacha System Functions - Inline to avoid import issues
const rollProfileFrame = async (userId: string) => {
  console.log('🎲 rollProfileFrame called with:', { userId });
  
  try {
    // Using singleton Supabase client

    console.log('✅ Using real Supabase client for rollProfileFrame');
    
    // Use the database function to roll for a frame
    console.log('🎲 Calling roll_profile_frame with user_uuid:', userId, 'type:', typeof userId);
    const { data, error } = await supabase.rpc('roll_profile_frame', {
      user_uuid: userId
    });
    
    console.log('🎲 RPC response:', { data, error });
    
    if (error) {
      console.error('❌ Error rolling for profile frame:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      
      // Check if it's a 400 error (likely no frames available)
      if (error.code === 'PGRST301' || error.message?.includes('400')) {
        console.log('🔧 No frames available, creating fallback frame...');
        return {
          id: 999,
          name: 'Simple Gray Frame',
          rarity: 'common',
          imageUrl: '/assets/Season 1/Simple Gray Frame Common.png',
          isNew: true
        };
      }
      
      return null;
    }
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log('🎲 Rolled frame:', result);
      return {
        id: result.frame_id,
        name: result.frame_name,
        rarity: result.frame_rarity,
        imageUrl: result.frame_image_url,
        isNew: result.is_new
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error in rollProfileFrame:', error);
    return null;
  }
};

const getAvailableFrames = async () => {
  console.log('🎯 getAvailableFrames called');
  
  // Return mock available frames for current season
  return [
    {
      id: 1,
      name: 'Green Leaf Frame',
      description: 'A legendary green leaf frame representing nature\'s power',
      rarity: 'legendary' as const,
      imageUrl: '/assets/Season 1/Green Leaf Frame Legendary.png',
      previewUrl: '/assets/Season 1/Green Leaf Frame Legendary.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.002,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 2,
      name: 'Red Cat Frame',
      description: 'A fierce red cat frame with mysterious feline energy',
      rarity: 'epic' as const,
      imageUrl: '/assets/Season 1/Red Cat Frame Epic.png',
      previewUrl: '/assets/Season 1/Red Cat Frame Epic.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.015,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 3,
      name: 'Pink Fairy Frame',
      description: 'A magical pink fairy frame with enchanting sparkles',
      rarity: 'rare' as const,
      imageUrl: '/assets/Season 1/Pink Fairy Frame Rare.png',
      previewUrl: '/assets/Season 1/Pink Fairy Frame Rare.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.04,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 4,
      name: 'Blue Butterfly Frame',
      description: 'A delicate blue butterfly frame with graceful wings',
      rarity: 'rare' as const,
      imageUrl: '/assets/Season 1/Blue Butterfly Frame Rare.png',
      previewUrl: '/assets/Season 1/Blue Butterfly Frame Rare.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.04,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 5,
      name: 'Green Mushroom Frame',
      description: 'A whimsical green mushroom frame from the forest',
      rarity: 'uncommon' as const,
      imageUrl: '/assets/Season 1/Green Mushroom Frame Uncommon.png',
      previewUrl: '/assets/Season 1/Green Mushroom Frame Uncommon.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.10,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 6,
      name: 'Yellow Star Frame',
      description: 'A bright yellow star frame that shines with optimism',
      rarity: 'uncommon' as const,
      imageUrl: '/assets/Season 1/Yellow Star Frame Uncommon.png',
      previewUrl: '/assets/Season 1/Yellow Star Frame Uncommon.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.10,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 7,
      name: 'Simple Gray Frame',
      description: 'A simple and elegant gray frame for everyday use',
      rarity: 'common' as const,
      imageUrl: '/assets/Season 1/Simple Gray Frame Common.png',
      previewUrl: '/assets/Season 1/Simple Gray Frame Common.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.40,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 8,
      name: 'Purple Heart Frame',
      description: 'A charming purple heart frame with romantic vibes',
      rarity: 'common' as const,
      imageUrl: '/assets/Season 1/Purple Heart Frame Common.png',
      previewUrl: '/assets/Season 1/Purple Heart Frame Common.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.30,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 9,
      name: 'Red Heart Frame',
      description: 'A legendary red heart frame symbolizing eternal love',
      rarity: 'legendary' as const,
      imageUrl: '/assets/Season 1/Red Heart Frame Legendary.png',
      previewUrl: '/assets/Season 1/Red Heart Frame Legendary.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.002,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    },
    {
      id: 10,
      name: 'Purple Bird Frame',
      description: 'A mythical purple bird frame with divine avian grace',
      rarity: 'mythic' as const,
      imageUrl: '/assets/Season 1/Purple Bird Frame Mythic.png',
      previewUrl: '/assets/Season 1/Purple Bird Frame Mythic.png',
      seasonId: 1,
      seasonName: 'Season 1',
      dropRate: 0.001,
      isNew: false,
      quantity: 0,
      obtainedAt: null,
      isEquipped: false
    }
  ];
};

interface ProfileFrame {
  id: number;
  name: string;
  description?: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl: string;
  previewUrl?: string;
  seasonId: number;
  seasonName: string;
  dropRate: number;
  isNew?: boolean;
  quantity?: number;
  obtainedAt?: string;
  isEquipped?: boolean;
}

const mockProfileCards: ProfileCard[] = [
  {
    id: '1',
    name: 'Alex Chen',
    handle: '@alex_chen',
    rarity: 'mythic',
    imageUrl: '/attached_assets/IMG_0653_1753250221773.png',
    bio: 'Building the future, one algorithm at a time. AI enthusiast, coffee addict, and occasional philosopher.',
    followers: 125000,
    profilePower: 892,
    quantity: 1,
  },
  {
    id: '2',
    name: 'Maya Rodriguez',
    handle: '@maya_rodriguez',
    rarity: 'legendary',
    imageUrl: '/attached_assets/IMG_0654_1753256178546.png',
    bio: 'Protecting our oceans, one coral reef at a time. Diver, scientist, and advocate for marine conservation.',
    followers: 89000,
    profilePower: 634,
    quantity: 1,
  },
  {
    id: '3',
    name: 'Jordan Kim',
    handle: '@jordan_kim',
    rarity: 'epic',
    imageUrl: '/attached_assets/IMG_0655_1753256178546.png',
    bio: 'Creating digital art that bridges reality and imagination. NFT artist, designer, and tech enthusiast.',
    followers: 67000,
    profilePower: 487,
    quantity: 1,
  },
  {
    id: '4',
    name: 'Sam Taylor',
    handle: '@sam_taylor',
    rarity: 'rare',
    imageUrl: '/attached_assets/IMG_0653_1753250221773.png',
    bio: 'Musician, producer, and sound engineer. Always chasing the perfect beat.',
    followers: 45000,
    profilePower: 312,
    quantity: 1,
  },
  {
    id: '5',
    name: 'Riley Park',
    handle: '@riley_park',
    rarity: 'uncommon',
    imageUrl: '/attached_assets/IMG_0654_1753256178546.png',
    bio: 'Food blogger and chef. Sharing recipes and culinary adventures from around the world.',
    followers: 28000,
    profilePower: 198,
    quantity: 1,
  },
  {
    id: '6',
    name: 'Casey Lee',
    handle: '@casey_lee',
    rarity: 'common',
    imageUrl: '/attached_assets/IMG_0655_1753256178546.png',
    bio: 'Student, gamer, and aspiring developer. Learning to code one bug at a time.',
    followers: 12000,
    profilePower: 89,
    quantity: 1,
  },
];

const rarityColors = {
  mythic: '#ef4444',
  legendary: '#f59e0b',
  epic: '#8b5cf6',
  rare: '#3b82f6',
  uncommon: '#10b981',
  common: '#6b7280',
};

const rarityNames = {
  mythic: 'Mythic',
  legendary: 'Legendary',
  epic: 'Epic',
  rare: 'Rare',
  uncommon: 'Uncommon',
  common: 'Common',
};

// Custom Icon Components
const ChirpCrystalIcon = ({ size = 24, color = "#C671FF" }) => (
  <img 
    src="/assets/Season 1/Chirp Crystal v2.png" 
    alt="Chirp Crystal" 
    style={{ 
      width: size, 
      height: size,
      filter: color !== "#C671FF" ? `hue-rotate(${color === "white" ? "0deg" : "180deg"}) saturate(2)` : "none"
    }}
  />
);

const GachaIcon = ({ size = 24, color = "#FF61A6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <path d="M8 12h8M12 8v8" stroke={color} strokeWidth="2"/>
  </svg>
);

const CollectionIcon = ({ size = 24, color = "#f5a5e0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2"/>
    <path d="M9 9h6v6H9z" stroke={color} strokeWidth="2"/>
  </svg>
);

const HeartIcon = ({ size = 24, color = "#C671FF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
      fill={color}
    />
  </svg>
);

const BirdIcon = ({ size = 24, color = "#FF61A6" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M23 4a1 1 0 0 0-1.447-.894L12.224 7.77a.5.5 0 0 1-.448 0L2.447 3.106A1 1 0 0 0 1 4v13.382a1.99 1.99 0 0 0 1.105 1.79l9.448 4.728c.14.065.293.1.447.1.154-.005.306-.04.447-.1l9.453-4.724a1.99 1.99 0 0 0 1.1-1.789V4z" 
      fill={color}
    />
  </svg>
);

const ChirpLogo = ({ size = 24, color = "#f5a5e0" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" 
      fill={color}
    />
  </svg>
);

export default function Gacha() {
  const { user, updateUser, refreshCrystalBalance } = useSupabaseAuth();
  const { toast } = useToast();
  const [availableFrames, setAvailableFrames] = useState<ProfileFrame[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [pulledFrame, setPulledFrame] = useState<ProfileFrame | null>(null);
  const [showPulledFrame, setShowPulledFrame] = useState(false);
  const [pulledFrames, setPulledFrames] = useState<ProfileFrame[]>([]);
  const [showPulledFrames, setShowPulledFrames] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCrystalInfoModal, setShowCrystalInfoModal] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<string>('');

  // Load available frames on component mount
  useEffect(() => {
    loadAvailableFrames();
  }, []);

  const loadAvailableFrames = async () => {
    try {
      const frames = await getAvailableFrames();
      setAvailableFrames(frames);
      if (frames.length > 0) {
        setCurrentSeason(frames[0].seasonName);
      }
    } catch (error) {
      console.error('Error loading available frames:', error);
    }
  };

  // Helper function to get current crystal balance
  const getCurrentCrystalBalance = (): number => {
    const crystalBalance = user?.crystalBalance;
    
    if (!crystalBalance) return 0;
    
    // Handle object with balance property
    if (typeof crystalBalance === 'object' && crystalBalance !== null) {
      const balanceObj = crystalBalance as Record<string, any>;
      if ('balance' in balanceObj && typeof balanceObj.balance === 'number') {
        return balanceObj.balance || 0;
      }
    }
    
    // Handle number
    if (typeof crystalBalance === 'number') {
      return crystalBalance;
    }
    
    return 0;
  };

  const openCapsule = async (): Promise<ProfileFrame | null> => {
    try {
      if (!user?.id) {
        console.error('❌ No user ID available for rolling');
        return null;
      }
      
      const rolledFrame = await rollProfileFrame(user.id);
      return rolledFrame;
    } catch (error) {
      console.error('❌ Error in openCapsule:', error);
      return null;
    }
  };

  const rollForFrame = async (rollCount: number = 1) => {
    if (isRolling) return;
    
    const cost = rollCount === 10 ? 950 : 100;
    
    // Check if user has enough crystals
    const currentBalance = getCurrentCrystalBalance();
    
    if (currentBalance < cost) {
      toast({
        title: "Insufficient Crystals",
        description: `You need ${cost} crystals to open a capsule. Like chirps (+1) or comment (+5) to earn crystals!`,
        variant: "destructive",
      });
      return;
    }

    setIsRolling(true);
    
    // Simulate capsule opening animation
    setTimeout(async () => {
      try {
        console.log('🎲 Starting capsule opening animation...');
        const results: ProfileFrame[] = [];
        
        for (let i = 0; i < rollCount; i++) {
          console.log(`🎲 Rolling capsule ${i + 1}/${rollCount}...`);
          const newFrame = await openCapsule();
          console.log('🎲 Capsule result:', newFrame?.name, newFrame?.rarity);
          
          if (newFrame) {
            const frameWithTimestamp = {
              ...newFrame,
              obtainedAt: new Date().toISOString(),
            };
            results.push(frameWithTimestamp);
            console.log('✅ Frame added to results:', frameWithTimestamp);
          } else {
            console.error('❌ Failed to get frame from openCapsule');
          }
      }
      
      console.log('🎲 Total results:', results.length, results);
      
      if (results.length === 0) {
        console.error('❌ No frames were rolled successfully');
        toast({
          title: "Roll Failed",
          description: "Unable to roll for frames. Please try again.",
          variant: "destructive",
        });
        setIsRolling(false);
        return;
      }
      
      if (results.length > 0) {
          console.log('✅ Successfully rolled frames, deducting crystals...');
          // Deduct crystal balance from database
          try {
            console.log('💎 Deducting crystals from database...');
            
            // Use direct Supabase client for web
            const { createClient } = await import('@supabase/supabase-js');
            const SUPABASE_URL = 'https://qrzbtituxxilnbgocdge.supabase.co';
            const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
            
            const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              auth: {
                storage: {
                  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
                  setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
                  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key))
                },
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
              },
            });

            // Deduct crystal balance directly
            const { error } = await supabase
              .from('users')
              .update({ 
                crystal_balance: supabase.raw(`crystal_balance - ${cost}`)
              })
              .eq('id', user.id);
            
            const success = !error;
            
            if (success) {
              // Refresh crystal balance from database to update UI
              await refreshCrystalBalance();
              console.log('💎 Crystal balance updated successfully');
            } else {
              console.error('Failed to deduct crystal balance');
              // If database deduction fails, still update local state as fallback
              const currentBalance = getCurrentCrystalBalance();
              const newBalance = currentBalance - cost;
              await updateUser({ crystalBalance: newBalance });
              console.log('💎 Fallback: Updated crystal balance in AuthContext');
            }
          } catch (error) {
            console.error('Error deducting crystal balance:', error);
            // Fallback to local state update if database fails
            const currentBalance = getCurrentCrystalBalance();
            const newBalance = currentBalance - cost;
            await updateUser({ crystalBalance: newBalance });
            console.log('💎 Fallback: Updated crystal balance in AuthContext');
          }
          
          // Show different modals based on roll count
          if (rollCount === 10) {
            // Show multi-frame results for 10-roll
            setPulledFrames(results);
            setShowPulledFrames(true);
          } else {
            // Show single frame result for 1-roll
            setPulledFrame(results[0]);
            setShowPulledFrame(true);
          }
          
          toast({
            title: "Capsule Opened!",
            description: `Successfully opened ${results.length} capsule${results.length > 1 ? 's' : ''}!`,
          });
        }
        
        setIsRolling(false);
      } catch (error) {
        console.error('Error in capsule opening:', error);
        setIsRolling(false);
        toast({
          title: "Error",
          description: "Failed to open capsule. Please try again.",
          variant: "destructive",
        });
      }
    }, 2000); // 2 second animation
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '60px',
        paddingBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          Chirp Gacha
        </h1>
        <button
          onClick={() => setShowHelpModal(true)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            backgroundColor: '#C671FF',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white'
          }}>?</span>
        </button>
      </div>

      {/* Crystal Balance */}
      <div style={{
        paddingLeft: '20px',
        paddingRight: '20px',
        marginBottom: '20px'
      }}>
        <div
          onClick={() => setShowCrystalInfoModal(true)}
          style={{
            borderRadius: '16px',
            padding: '16px',
            border: '2px solid #C671FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            backgroundColor: '#ffffff'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ChirpCrystalIcon size={60} />
            <span style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#C671FF',
              marginLeft: '12px',
              lineHeight: '56px'
            }}>
              {getCurrentCrystalBalance().toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Gacha Banner */}
      <div style={{
        marginLeft: '-150px',
        marginRight: '-150px',
        width: 'calc(100vw + 300px)',
        height: '500px',
        alignSelf: 'center',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <img
          src="/assets/Gacha banner.png"
          alt="Gacha Banner"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            objectFit: 'contain'
          }}
        />
        
        {/* Loading Animation Overlay */}
        {isRolling && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px'
          }}>
            <video
              autoPlay
              loop={false}
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '16px'
              }}
              onEnded={() => setIsRolling(false)}
            >
              <source src="/public/assets/gacha-opening-animation.mp4" type="video/mp4" />
            </video>
            {/* Loading Text Overlay */}
            <div style={{
              position: 'absolute',
              bottom: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>Drawing capsules...</h2>
              <p style={{
                fontSize: '16px',
                margin: 0,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
              }}>Please wait</p>
            </div>
          </div>
        )}
        
        {/* Capsule Buttons Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '150px',
          right: '150px',
          display: 'flex',
          justifyContent: 'center',
          paddingLeft: '10px',
          paddingRight: '10px',
          gap: '20px'
        }}>
          <button
            onClick={() => rollForFrame(1)}
            disabled={isRolling || getCurrentCrystalBalance() < 100}
            style={{
              borderRadius: '25px',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '20px',
              paddingRight: '20px',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white',
              border: 'none',
              cursor: getCurrentCrystalBalance() >= 100 ? 'pointer' : 'not-allowed',
              opacity: getCurrentCrystalBalance() >= 100 ? 1 : 0.6,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              if (getCurrentCrystalBalance() >= 100) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>Open 1</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '4px'
              }}>
                <ChirpCrystalIcon size={16} color="white" />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                  color: getCurrentCrystalBalance() >= 100 ? 'white' : '#fca5a5'
                }}>100</span>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => rollForFrame(10)}
            disabled={isRolling || getCurrentCrystalBalance() < 950}
            style={{
              borderRadius: '25px',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '20px',
              paddingRight: '20px',
              minWidth: '120px',
              background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
              color: 'white',
              border: 'none',
              cursor: getCurrentCrystalBalance() >= 950 ? 'pointer' : 'not-allowed',
              opacity: getCurrentCrystalBalance() >= 950 ? 1 : 0.6,
              transition: 'all 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              if (getCurrentCrystalBalance() >= 950) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>Open 10</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '4px'
              }}>
                <ChirpCrystalIcon size={16} color="white" />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginLeft: '4px',
                  color: getCurrentCrystalBalance() >= 950 ? 'white' : '#fca5a5'
                }}>950</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>How It Works</h2>
              <button
                onClick={() => setShowHelpModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>1</div>
                <p style={{ color: '#374151', margin: 0 }}>Like chirps to earn 1 crystal each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>2</div>
                <p style={{ color: '#374151', margin: 0 }}>Comment on chirps to earn 5 crystals each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>3</div>
                <p style={{ color: '#374151', margin: 0 }}>Use crystals to open capsules and collect rare profiles</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>4</div>
                <p style={{ color: '#374151', margin: 0 }}>Build your collection and discover amazing people</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crystal Info Modal */}
      {showCrystalInfoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>How to Collect Crystals</h2>
              <button
                onClick={() => setShowCrystalInfoModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>1</div>
                <p style={{ color: '#374151', margin: 0 }}>Like chirps to earn 1 crystal each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>2</div>
                <p style={{ color: '#374151', margin: 0 }}>Comment on chirps to earn 5 crystals each</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pulled Frame Modal */}
      {showPulledFrame && pulledFrame && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>You Got a New Profile Frame!</h2>
              <button
                onClick={() => setShowPulledFrame(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={pulledFrame.imageUrl}
                  alt={pulledFrame.name}
                  style={{
                    width: '128px',
                    height: '128px',
                    objectFit: 'contain',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: rarityColors[pulledFrame.rarity],
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {rarityNames[pulledFrame.rarity]}
                </div>
              </div>
              <div>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  margin: 0
                }}>{pulledFrame.name}</h3>
                <p style={{
                  color: '#6b7280',
                  margin: 0
                }}>{pulledFrame.description}</p>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  marginTop: '8px',
                  margin: 0
                }}>Season: {pulledFrame.seasonName}</p>
              </div>
              <button 
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onClick={() => setShowPulledFrame(false)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Equip Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Frame Results Modal */}
      {showPulledFrames && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>10-Roll Results!</h2>
              <button
                onClick={() => setShowPulledCards(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{
                  textAlign: 'center',
                  color: '#6b7280',
                  margin: 0
                }}>You pulled {pulledFrames.length} profile frames!</p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  {pulledFrames.map((frame, index) => (
                    <div key={`${frame.id}-${index}`} style={{
                      textAlign: 'center',
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
                        <img
                          src={frame.imageUrl}
                          alt={frame.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'contain',
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          backgroundColor: rarityColors[frame.rarity],
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {rarityNames[frame.rarity]}
                        </div>
                      </div>
                      <h4 style={{
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#1f2937',
                        margin: 0
                      }}>{frame.name}</h4>
                      <p style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        margin: 0
                      }}>{frame.seasonName}</p>
                    </div>
                  ))}
                </div>
                <button 
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => setShowPulledFrames(false)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}