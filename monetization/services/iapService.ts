// monetization/services/iapService.ts
import {
    endConnection,
    finishTransaction,
    getProducts,
    initConnection,
    purchaseErrorListener,
    purchaseUpdatedListener,
    requestPurchase,
    type ProductPurchase,
    type PurchaseError,
} from 'react-native-iap';
import { supabase } from '../../mobile-db-supabase';
import type {
    CrystalPackage,
    FeatureFlags,
    IAPProduct,
    PurchaseHistory
} from '../types/iap';

class IAPService {
  private purchaseUpdateSubscription: any = null;
  private purchaseErrorSubscription: any = null;
  private isInitialized = false;
  private featureFlags: FeatureFlags = {
    enableIAP: true,
    enablePaywall: true,
    enableCrystalShop: true,
    enableBonusCrystals: true,
    enablePurchaseValidation: true,
    fallbackToOfflineMode: true,
  };

  // Crystal packages configuration
  private crystalPackages: CrystalPackage[] = [
    {
      id: 'crystals_small',
      productId: 'com.chirp.crystals.small',
      crystals: 100,
      price: 0.99,
      currency: 'USD',
      title: 'Small Crystal Pack',
      description: '100 Crystals',
    },
    {
      id: 'crystals_medium',
      productId: 'com.chirp.crystals.medium',
      crystals: 500,
      price: 4.99,
      currency: 'USD',
      title: 'Medium Crystal Pack',
      description: '500 Crystals',
      popular: true,
    },
    {
      id: 'crystals_large',
      productId: 'com.chirp.crystals.large',
      crystals: 1200,
      price: 9.99,
      currency: 'USD',
      title: 'Large Crystal Pack',
      description: '1200 Crystals + 200 Bonus',
      bonus: 200,
    },
    {
      id: 'crystals_mega',
      productId: 'com.chirp.crystals.mega',
      crystals: 2500,
      price: 19.99,
      currency: 'USD',
      title: 'Mega Crystal Pack',
      description: '2500 Crystals + 500 Bonus',
      bonus: 500,
    },
  ];

  async initialize(): Promise<boolean> {
    try {
      console.log('🔄 Initializing IAP Service...');
      
      // Initialize connection to App Store/Google Play
      const result = await initConnection();
      console.log('✅ IAP Connection initialized:', result);

      // Set up purchase listeners
      this.setupPurchaseListeners();

      // Load feature flags from Supabase
      await this.loadFeatureFlags();

      this.isInitialized = true;
      console.log('✅ IAP Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize IAP Service:', error);
      return false;
    }
  }

  private setupPurchaseListeners(): void {
    // Listen for successful purchases
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: ProductPurchase) => {
        console.log('💰 Purchase received:', {
          productId: purchase.productId,
          transactionId: purchase.transactionId,
          transactionReceipt: purchase.transactionReceipt ? `${purchase.transactionReceipt.substring(0, 20)}...${purchase.transactionReceipt.substring(purchase.transactionReceipt.length - 10)}` : 'null',
          transactionDate: purchase.transactionDate,
          userCancelled: purchase.userCancelled
        });
        await this.handlePurchase(purchase);
      }
    );

    // Listen for purchase errors
    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.error('❌ Purchase error:', error);
        this.handlePurchaseError(error);
      }
    );
  }

  async getAvailableProducts(): Promise<IAPProduct[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productIds = this.crystalPackages.map(pkg => pkg.productId);
      console.log('🔄 Fetching products:', productIds);

      const products = await getProducts({ skus: productIds });
      console.log('✅ Products fetched:', products);

      return products.map(product => ({
        productId: product.productId,
        price: product.price,
        currency: product.currency,
        title: product.title,
        description: product.description,
        localizedPrice: product.localizedPrice,
        type: product.type as 'consumable' | 'non_consumable' | 'subscription',
      }));
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      return [];
    }
  }

  async purchaseProduct(productId: string): Promise<boolean> {
    try {
      if (!this.featureFlags.enableIAP) {
        console.log('⚠️ IAP is disabled by feature flag');
        return false;
      }

      console.log('🔄 Starting purchase for:', productId);
      
      const result = await requestPurchase({ sku: productId });
      console.log('✅ Purchase request sent:', result);
      
      return true;
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      return false;
    }
  }

  private async handlePurchase(purchase: ProductPurchase): Promise<void> {
    try {
      console.log('🔄 Processing purchase:', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        transactionReceipt: purchase.transactionReceipt ? `${purchase.transactionReceipt.substring(0, 20)}...${purchase.transactionReceipt.substring(purchase.transactionReceipt.length - 10)}` : 'null',
        transactionDate: purchase.transactionDate,
        userCancelled: purchase.userCancelled
      });

      // Find the crystal package for this product
      const crystalPackage = this.crystalPackages.find(
        pkg => pkg.productId === purchase.productId
      );

      if (!crystalPackage) {
        console.error('❌ Unknown product ID:', purchase.productId);
        await finishTransaction({ purchase, isConsumable: true });
        return;
      }

      // Validate purchase with Supabase
      const isValid = await this.validatePurchase(purchase);
      
      if (isValid) {
        // Add crystals to user's balance
        await this.addCrystalsToUser(crystalPackage, purchase);
        
        // Record purchase history
        await this.recordPurchaseHistory(crystalPackage, purchase);
        
        console.log('✅ Purchase processed successfully');
      } else {
        console.error('❌ Purchase validation failed');
      }

      // Finish the transaction
      await finishTransaction({ purchase, isConsumable: true });
    } catch (error) {
      console.error('❌ Error handling purchase:', error);
    }
  }

  private async validatePurchase(purchase: ProductPurchase): Promise<boolean> {
    try {
      if (!this.featureFlags.enablePurchaseValidation) {
        console.log('⚠️ Purchase validation disabled by feature flag');
        return true;
      }

      // In a real implementation, you would validate the receipt with Apple/Google
      // For now, we'll do basic validation
      const isValid = purchase.transactionId && purchase.transactionReceipt;
      
      if (isValid) {
        console.log('✅ Purchase validation passed');
      } else {
        console.error('❌ Purchase validation failed');
      }

      return isValid;
    } catch (error) {
      console.error('❌ Purchase validation error:', error);
      return this.featureFlags.fallbackToOfflineMode;
    }
  }

  private async addCrystalsToUser(
    crystalPackage: CrystalPackage,
    purchase: ProductPurchase
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const totalCrystals = crystalPackage.crystals + (crystalPackage.bonus || 0);
      
      // Update user's crystal balance in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          crystal_balance: supabase.raw('crystal_balance + ?', [totalCrystals]),
          total_crystals_purchased: supabase.raw('total_crystals_purchased + ?', [totalCrystals]),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log(`✅ Added ${totalCrystals} crystals to user ${user.id}`);
    } catch (error) {
      console.error('❌ Failed to add crystals to user:', error);
      throw error;
    }
  }

  private async recordPurchaseHistory(
    crystalPackage: CrystalPackage,
    purchase: ProductPurchase
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const purchaseRecord: Omit<PurchaseHistory, 'id'> = {
        userId: user.id,
        productId: crystalPackage.productId,
        crystals: crystalPackage.crystals + (crystalPackage.bonus || 0),
        price: crystalPackage.price,
        currency: crystalPackage.currency,
        transactionId: purchase.transactionId,
        purchaseDate: new Date().toISOString(),
        status: 'completed',
        receipt: purchase.transactionReceipt,
        validated: true,
      };

      const { error } = await supabase
        .from('purchase_history')
        .insert(purchaseRecord);

      if (error) {
        throw error;
      }

      console.log('✅ Purchase history recorded');
    } catch (error) {
      console.error('❌ Failed to record purchase history:', error);
    }
  }

  private handlePurchaseError(error: PurchaseError): void {
    console.error('❌ Purchase error:', error);
    
    if (error.userCancelled) {
      console.log('ℹ️ User cancelled purchase');
    } else {
      console.error('❌ Purchase failed:', error.message);
    }
  }

  async getUserCrystalBalance(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return 0;
      }

      const { data, error } = await supabase
        .from('users')
        .select('crystal_balance')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Failed to get crystal balance:', error);
        return 0;
      }

      return data?.crystal_balance || 0;
    } catch (error) {
      console.error('❌ Error getting crystal balance:', error);
      return 0;
    }
  }

  async spendCrystals(amount: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      const currentBalance = await this.getUserCrystalBalance();
      if (currentBalance < amount) {
        console.log('❌ Insufficient crystals');
        return false;
      }

      const { error } = await supabase
        .from('users')
        .update({
          crystal_balance: supabase.raw('crystal_balance - ?', [amount]),
          total_crystals_spent: supabase.raw('total_crystals_spent + ?', [amount]),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      console.log(`✅ Spent ${amount} crystals`);
      return true;
    } catch (error) {
      console.error('❌ Failed to spend crystals:', error);
      return false;
    }
  }

  private async loadFeatureFlags(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('name', 'iap_settings')
        .single();

      if (data && !error) {
        this.featureFlags = { ...this.featureFlags, ...data.settings };
        console.log('✅ Feature flags loaded:', this.featureFlags);
      }
    } catch (error) {
      console.log('⚠️ Using default feature flags:', error);
    }
  }

  getCrystalPackages(): CrystalPackage[] {
    return this.crystalPackages;
  }

  getFeatureFlags(): FeatureFlags {
    return this.featureFlags;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.purchaseUpdateSubscription) {
        this.purchaseUpdateSubscription.remove();
      }
      if (this.purchaseErrorSubscription) {
        this.purchaseErrorSubscription.remove();
      }
      await endConnection();
      console.log('✅ IAP Service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up IAP Service:', error);
    }
  }
}

export const iapService = new IAPService();
export default iapService;
