// monetization/hooks/useCrystalBalance.ts
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../mobile-db-supabase';
import type { CrystalBalance } from '../types/iap';

export const useCrystalBalance = () => {
  const [balance, setBalance] = useState<CrystalBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('crystal_balance, total_crystals_purchased, total_crystals_spent, updated_at')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const crystalBalance: CrystalBalance = {
        userId: user.id,
        crystals: data?.crystal_balance || 0,
        lastUpdated: data?.updated_at || new Date().toISOString(),
        totalPurchased: data?.total_crystals_purchased || 0,
        totalSpent: data?.total_crystals_spent || 0,
      };

      setBalance(crystalBalance);
    } catch (err) {
      console.error('❌ Failed to fetch crystal balance:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBalance = useCallback((newBalance: number) => {
    setBalance(prev => prev ? {
      ...prev,
      crystals: newBalance,
      lastUpdated: new Date().toISOString(),
    } : null);
  }, []);

  const addCrystals = useCallback((amount: number) => {
    setBalance(prev => prev ? {
      ...prev,
      crystals: prev.crystals + amount,
      totalPurchased: prev.totalPurchased + amount,
      lastUpdated: new Date().toISOString(),
    } : null);
  }, []);

  const spendCrystals = useCallback((amount: number) => {
    setBalance(prev => prev ? {
      ...prev,
      crystals: Math.max(0, prev.crystals - amount),
      totalSpent: prev.totalSpent + amount,
      lastUpdated: new Date().toISOString(),
    } : null);
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    updateBalance,
    addCrystals,
    spendCrystals,
  };
};
