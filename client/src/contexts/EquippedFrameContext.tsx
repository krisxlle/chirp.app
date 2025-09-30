import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

interface EquippedFrame {
  id: number;
  name: string;
  rarity: string;
  imageUrl: string;
  equippedAt: string;
}

interface EquippedFrameContextType {
  equippedFrames: Record<string, EquippedFrame | null>;
  fetchEquippedFrame: (userId: string) => Promise<EquippedFrame | null>;
  clearEquippedFrame: (userId: string) => void;
}

const EquippedFrameContext = createContext<EquippedFrameContextType | undefined>(undefined);

interface EquippedFrameProviderProps {
  children: ReactNode;
}

export function EquippedFrameProvider({ children }: EquippedFrameProviderProps) {
  const [equippedFrames, setEquippedFrames] = useState<Record<string, EquippedFrame | null>>({});

  const fetchEquippedFrame = async (userId: string): Promise<EquippedFrame | null> => {
    // Return cached result if available
    if (equippedFrames[userId] !== undefined) {
      return equippedFrames[userId];
    }

    try {
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

      console.log('🎯 Fetching equipped frame for user:', userId);
      
      const { data, error } = await supabase.rpc('get_user_equipped_frame', {
        user_uuid: userId
      });
      
      if (error) {
        console.error('❌ Error fetching equipped frame:', error);
        setEquippedFrames(prev => ({ ...prev, [userId]: null }));
        return null;
      }
      
      if (data && data.length > 0) {
        const result = data[0];
        const equippedFrame: EquippedFrame = {
          id: result.frame_id,
          name: result.frame_name,
          rarity: result.frame_rarity,
          imageUrl: result.frame_image_url,
          equippedAt: result.equipped_at
        };
        
        setEquippedFrames(prev => ({ ...prev, [userId]: equippedFrame }));
        return equippedFrame;
      }
      
      setEquippedFrames(prev => ({ ...prev, [userId]: null }));
      return null;
    } catch (error) {
      console.error('❌ Error in fetchEquippedFrame:', error);
      setEquippedFrames(prev => ({ ...prev, [userId]: null }));
      return null;
    }
  };

  const clearEquippedFrame = (userId: string) => {
    setEquippedFrames(prev => ({ ...prev, [userId]: null }));
  };

  return (
    <EquippedFrameContext.Provider value={{
      equippedFrames,
      fetchEquippedFrame,
      clearEquippedFrame
    }}>
      {children}
    </EquippedFrameContext.Provider>
  );
}

export function useEquippedFrame() {
  const context = useContext(EquippedFrameContext);
  if (context === undefined) {
    throw new Error('useEquippedFrame must be used within an EquippedFrameProvider');
  }
  return context;
}
