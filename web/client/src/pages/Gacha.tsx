import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';

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
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  // Load collection when component mounts
  useEffect(() => {
    if (user?.id) {
      loadUserCollection();
    }
  }, [user?.id]);

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

  // Load user's frame collection
  const loadUserCollection = async () => {
    if (!user?.id) return;
    
    setIsLoadingCollection(true);
    try {
      console.log('📚 Loading user collection...');
      
      const response = await fetch('/api/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getCollection',
          userId: user.id
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load collection');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const collectionData = result.data;
        console.log('📚 Collection loaded:', collectionData);
        
        // Convert collection data to ProfileCard format
        const profileCards: ProfileCard[] = collectionData.map((item: any) => ({
          id: item.frameId.toString(),
          name: item.frameName,
          handle: `@${item.frameName.toLowerCase().replace(/\s+/g, '_')}`,
          rarity: item.frameRarity,
          imageUrl: item.frameImageUrl,
          bio: `A ${item.frameRarity} profile frame in your collection!`,
          followers: 0, // Remove mock data
          profilePower: 0, // Remove mock data
          quantity: item.quantity,
          obtainedAt: item.obtainedAt
        }));
        
        setCollection(profileCards);
      }
    } catch (error) {
      console.error('❌ Error loading collection:', error);
    } finally {
      setIsLoadingCollection(false);
    }
  };

  const openCapsule = async (): Promise<ProfileCard | null> => {
    try {
      console.log('🎲 Opening capsule via API...');
      
      const response = await fetch('/api/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'roll',
          userId: user?.id
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to roll for frame');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const frameData = result.data;
        console.log('🎲 API roll result:', frameData);
        
        // Convert frame data to ProfileCard format
        const profileCard: ProfileCard = {
          id: frameData.frameId.toString(),
          name: frameData.frameName,
          handle: `@${frameData.frameName.toLowerCase().replace(/\s+/g, '_')}`,
          rarity: frameData.frameRarity,
          imageUrl: frameData.frameImageUrl,
          bio: `A ${frameData.frameRarity} profile frame obtained from the gacha!`,
          followers: 0, // Remove mock data
          profilePower: 0, // Remove mock data
          quantity: 1,
          obtainedAt: frameData.obtainedAt
        };
        
        return profileCard;
      }
      
      throw new Error('Invalid API response');
    } catch (error) {
      console.error('❌ Error in openCapsule:', error);
      
      // Return null if API fails - no fallback to mock data
      return null;
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
          
          // Refresh collection after successful roll
          await loadUserCollection();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-48">
      {/* Header */}
      <div className="flex justify-between items-center p-6 pt-12">
        <h1 className="text-3xl font-bold text-gray-900">Chirp Blind Boxes</h1>
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
                <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                <p className="text-gray-700">Like chirps to earn 1 crystal each</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                <p className="text-gray-700">Comment on chirps to earn 2 crystals each</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                <p className="text-gray-700">Use crystals to open blind boxes and collect rare frames</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                <p className="text-gray-700">Build your collection and discover amazing frames</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Crystal Balance */}
      <div className="px-4 mb-3">
        <Card className="max-w-[600px] mx-auto border-2 border-purple-500">
          <CardContent className="p-3">
            <Dialog open={showCrystalInfoModal} onOpenChange={setShowCrystalInfoModal}>
              <DialogTrigger asChild>
                <div className="flex items-center justify-center cursor-pointer hover:scale-105 transition-transform gap-3">
                  <div className="w-11 h-11 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
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

      {/* Collection Section */}
      <div className="px-6 mb-4">
        <Card className="max-w-[600px] mx-auto">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Collection</h2>
            {isLoadingCollection ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading collection...</p>
              </div>
            ) : collection.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {collection.map((card) => (
                  <Card key={card.id} className="text-center">
                    <CardContent className="p-4">
                      <div className="relative inline-block mb-2">
                        <img
                          src={card.imageUrl}
                          alt={card.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto border-2"
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
                      <p className="text-xs text-gray-600">x{card.quantity}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No frames yet</h3>
                <p className="text-gray-500">Open some capsules to start your collection!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full banner visible (contain); frame height caps scroll */}
      <div className="relative w-full overflow-hidden rounded-xl bg-[#E2DAFF] h-[clamp(260px,calc(100dvh-212px),680px)]">
        <img
          src="/assets/Gacha banner.png"
          alt="Gacha Banner"
          className="absolute inset-0 h-full w-full object-contain object-center rounded-xl"
        />

        {!isRolling && (
          <div
            className="absolute z-[2] flex"
            style={{
              left: '50%',
              bottom: '3.5%',
              transform: 'translateX(-50%)',
              gap: 'clamp(10px, 3vw, 16px)',
            }}
          >
            <button
              onClick={() => rollForProfile(1)}
              disabled={getCurrentCrystalBalance() < 100}
              aria-label="Open 1 capsule"
              className="bg-transparent border-0 rounded-[14px]"
              style={{
                width: 'clamp(96px, 22vw, 132px)',
                height: 'clamp(44px, 8vw, 60px)',
                cursor: getCurrentCrystalBalance() >= 100 ? 'pointer' : 'not-allowed',
              }}
            />
            <button
              onClick={() => rollForProfile(10)}
              disabled={getCurrentCrystalBalance() < 950}
              aria-label="Open 10 capsules"
              className="bg-transparent border-0 rounded-[14px]"
              style={{
                width: 'clamp(96px, 22vw, 132px)',
                height: 'clamp(44px, 8vw, 60px)',
                cursor: getCurrentCrystalBalance() >= 950 ? 'pointer' : 'not-allowed',
              }}
            />
          </div>
        )}

        {isRolling && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl overflow-hidden">
            <video
              autoPlay
              loop={false}
              muted
              playsInline
              className="h-full w-full object-cover bg-gray-800"
            >
              <source src="/assets/gacha-opening-animation.mp4" type="video/mp4" />
            </video>
            <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 text-center text-white">
              <h2 className="text-3xl font-bold mb-2 drop-shadow-md">Drawing capsules...</h2>
              <p className="text-xl drop-shadow">Please wait</p>
            </div>
          </div>
        )}
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
          <div className="max-h-[60vh] overflow-y-auto">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
