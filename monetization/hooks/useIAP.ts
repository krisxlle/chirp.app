// monetization/hooks/useIAP.ts
import { useCallback, useEffect, useState } from 'react';
import { iapService } from '../services/iapService';
import type { CrystalPackage, FeatureFlags, IAPProduct, PurchaseState } from '../types/iap';

export const useIAP = () => {
  const [products, setProducts] = useState<IAPProduct[]>([]);
  const [crystalPackages, setCrystalPackages] = useState<CrystalPackage[]>([]);
  const [purchaseState, setPurchaseState] = useState<PurchaseState>({
    isLoading: false,
    error: null,
    lastPurchase: null,
  });
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    enableIAP: true,
    enablePaywall: true,
    enableCrystalShop: true,
    enableBonusCrystals: true,
    enablePurchaseValidation: true,
    fallbackToOfflineMode: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeIAP = useCallback(async () => {
    try {
      setPurchaseState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await iapService.initialize();
      if (success) {
        const products = await iapService.getAvailableProducts();
        const packages = iapService.getCrystalPackages();
        const flags = iapService.getFeatureFlags();
        
        setProducts(products);
        setCrystalPackages(packages);
        setFeatureFlags(flags);
        setIsInitialized(true);
        
        console.log('✅ IAP initialized successfully');
      } else {
        throw new Error('Failed to initialize IAP');
      }
    } catch (error) {
      console.error('❌ IAP initialization failed:', error);
      setPurchaseState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      }));
    } finally {
      setPurchaseState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const purchaseProduct = useCallback(async (productId: string) => {
    try {
      setPurchaseState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const success = await iapService.purchaseProduct(productId);
      if (!success) {
        throw new Error('Purchase failed');
      }
      
      console.log('✅ Purchase initiated for:', productId);
    } catch (error) {
      console.error('❌ Purchase error:', error);
      setPurchaseState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Purchase failed',
        isLoading: false 
      }));
    }
  }, []);

  const getCrystalBalance = useCallback(async () => {
    try {
      return await iapService.getUserCrystalBalance();
    } catch (error) {
      console.error('❌ Failed to get crystal balance:', error);
      return 0;
    }
  }, []);

  const spendCrystals = useCallback(async (amount: number) => {
    try {
      return await iapService.spendCrystals(amount);
    } catch (error) {
      console.error('❌ Failed to spend crystals:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    initializeIAP();
    
    return () => {
      iapService.cleanup();
    };
  }, [initializeIAP]);

  return {
    products,
    crystalPackages,
    purchaseState,
    featureFlags,
    isInitialized,
    purchaseProduct,
    getCrystalBalance,
    spendCrystals,
    initializeIAP,
  };
};
