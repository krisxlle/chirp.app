// monetization/types/iap.ts
export interface IAPProduct {
  productId: string;
  price: string;
  currency: string;
  title: string;
  description: string;
  localizedPrice: string;
  type: 'consumable' | 'non_consumable' | 'subscription';
}

export interface PurchaseResult {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
  purchaseToken?: string;
  dataAndroid?: string;
  signatureAndroid?: string;
  isAcknowledgedAndroid?: string;
}

export interface PurchaseError {
  code: string;
  message: string;
  userCancelled?: boolean;
}

export interface CrystalPackage {
  id: string;
  productId: string;
  crystals: number;
  price: number;
  currency: string;
  title: string;
  description: string;
  popular?: boolean;
  bonus?: number; // Bonus crystals for larger packages
}

export interface PurchaseState {
  isLoading: boolean;
  error: string | null;
  lastPurchase: PurchaseResult | null;
}

export interface CrystalBalance {
  userId: string;
  crystals: number;
  lastUpdated: string;
  totalPurchased: number;
  totalSpent: number;
}

export interface PurchaseHistory {
  id: string;
  userId: string;
  productId: string;
  crystals: number;
  price: number;
  currency: string;
  transactionId: string;
  purchaseDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receipt: string;
  validated: boolean;
}

export interface FeatureFlags {
  enableIAP: boolean;
  enablePaywall: boolean;
  enableCrystalShop: boolean;
  enableBonusCrystals: boolean;
  enablePurchaseValidation: boolean;
  fallbackToOfflineMode: boolean;
}

export interface PaywallConfig {
  enabled: boolean;
  triggerEvents: string[];
  showAfterActions: string[];
  cooldownMinutes: number;
  maxShowsPerDay: number;
}
