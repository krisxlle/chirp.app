import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { HelpCircle, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ProfileCard {
  id: string;
  name: string;
  handle: string;
  rarity: 'mythic' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
  imageUrl?: string;
  bio: string;
  followers: number;
  profilePower: number;
  quantity: number;
  obtainedAt?: string;
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

export default function Gacha() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collection, setCollection] = useState<ProfileCard[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [pulledCard, setPulledCard] = useState<ProfileCard | null>(null);
  const [showPulledCard, setShowPulledCard] = useState(false);
  const [pulledCards, setPulledCards] = useState<ProfileCard[]>([]);
  const [showPulledCards, setShowPulledCards] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCrystalInfoModal, setShowCrystalInfoModal] = useState(false);

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

  const openCapsule = async (): Promise<ProfileCard | null> => {
    try {
      // For now, use mock data - can be replaced with real API calls later
      const randomMockCard = mockProfileCards[Math.floor(Math.random() * mockProfileCards.length)];
      return randomMockCard;
    } catch (error) {
      console.error('❌ Error in openCapsule:', error);
      const randomMockCard = mockProfileCards[Math.floor(Math.random() * mockProfileCards.length)];
      return randomMockCard;
    }
  };

  const rollForProfile = async (rollCount: number = 1) => {
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
        const results: ProfileCard[] = [];
        
        for (let i = 0; i < rollCount; i++) {
          const newProfile = await openCapsule();
          console.log('🎲 Capsule result:', newProfile?.name, newProfile?.rarity);
          
          if (newProfile) {
            const profileWithTimestamp = {
              ...newProfile,
              obtainedAt: new Date().toISOString(),
            };
            results.push(profileWithTimestamp);
          }
        }
        
        if (results.length > 0) {
          // Show different modals based on roll count
          if (rollCount === 10) {
            // Show multi-card results for 10-roll
            setPulledCards(results);
            setShowPulledCards(true);
          } else {
            // Show single card result for 1-roll
            setPulledCard(results[0]);
            setShowPulledCard(true);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pt-16">
        <h1 className="text-3xl font-bold text-gray-900">Chirp Gacha - WEB VERSION</h1>
        <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:scale-105 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>How It Works</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                <p className="text-gray-700">Like chirps to earn 1 crystal each</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                <p className="text-gray-700">Comment on chirps to earn 2 crystals each</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">3</div>
                <p className="text-gray-700">Use crystals to open capsules and collect rare profiles</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">4</div>
                <p className="text-gray-700">Build your collection and discover amazing people</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Crystal Balance */}
      <div className="px-6 mb-6">
        <Card className="max-w-[600px] mx-auto border-2 border-purple-500">
          <CardContent className="p-6">
            <Dialog open={showCrystalInfoModal} onOpenChange={setShowCrystalInfoModal}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {getCurrentCrystalBalance().toLocaleString()}
                  </span>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>How to Collect Crystals</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">1</div>
                    <p className="text-gray-700">Like chirps to earn 1 crystal each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">2</div>
                    <p className="text-gray-700">Comment on chirps to earn 2 crystals each</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Gacha Banner - Full Page */}
      <div className="relative w-full h-screen">
        <img
          src="/assets/Gacha banner.png"
          alt="Gacha Banner"
          className="w-full h-full object-cover"
        />
        
        {/* Loading Animation Overlay */}
        {isRolling && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 opacity-90 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold mb-2">Drawing capsules...</h2>
              <p className="text-xl">Please wait</p>
            </div>
          </div>
        )}
        
        {/* Capsule Buttons Overlay */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <Button
            onClick={() => rollForProfile()}
            disabled={isRolling || getCurrentCrystalBalance() < 100}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-3 rounded-full font-bold text-lg min-w-[140px]"
          >
            <div className="flex flex-col items-center">
              <span>Open 1</span>
              <div className="flex items-center mt-1">
                <Sparkles className="h-4 w-4 mr-1" />
                <span className={getCurrentCrystalBalance() >= 100 ? 'text-white' : 'text-red-400'}>100</span>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => rollForProfile(10)}
            disabled={isRolling || getCurrentCrystalBalance() < 950}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-bold text-lg min-w-[140px]"
          >
            <div className="flex flex-col items-center">
              <span>Open 10</span>
              <div className="flex items-center mt-1">
                <Sparkles className="h-4 w-4 mr-1" />
                <span className={getCurrentCrystalBalance() >= 950 ? 'text-white' : 'text-red-400'}>950</span>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Pulled Card Modal */}
      <Dialog open={showPulledCard} onOpenChange={setShowPulledCard}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>You Got a New Profile!</DialogTitle>
          </DialogHeader>
          {pulledCard && (
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={pulledCard.imageUrl}
                  alt={pulledCard.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4"
                  style={{ borderColor: rarityColors[pulledCard.rarity] }}
                />
                <Badge 
                  className="absolute -top-2 -right-2 text-xs"
                  style={{ backgroundColor: rarityColors[pulledCard.rarity] }}
                >
                  {rarityNames[pulledCard.rarity]}
                </Badge>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{pulledCard.name}</h3>
                <p className="text-gray-600">{pulledCard.handle}</p>
                <p className="text-sm text-gray-700 mt-2">{pulledCard.bio}</p>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setShowPulledCard(false)}
              >
                View Profile
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Multi-Card Results Modal */}
      <Dialog open={showPulledCards} onOpenChange={setShowPulledCards}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>10-Roll Results!</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <p className="text-center text-gray-600">You pulled {pulledCards.length} profiles!</p>
              <div className="grid grid-cols-2 gap-4">
                {pulledCards.map((card, index) => (
                  <Card key={`${card.id}-${index}`} className="text-center">
                    <CardContent className="p-4">
                      <div className="relative inline-block mb-2">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-20 h-20 rounded-full object-cover mx-auto border-2"
                          style={{ borderColor: rarityColors[card.rarity] }}
                        />
                        <Badge 
                          className="absolute -top-1 -right-1 text-xs"
                          style={{ backgroundColor: rarityColors[card.rarity] }}
                        >
                          {rarityNames[card.rarity]}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-sm">{card.name}</h4>
                      <p className="text-xs text-gray-600">{card.handle}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setShowPulledCards(false)}
              >
                Close
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
