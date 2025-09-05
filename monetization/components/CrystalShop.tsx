// monetization/components/CrystalShop.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCrystalBalance } from '../hooks/useCrystalBalance';
import { useIAP } from '../hooks/useIAP';
import type { CrystalPackage } from '../types/iap';

interface CrystalShopProps {
  onClose?: () => void;
}

export const CrystalShop: React.FC<CrystalShopProps> = ({ onClose }) => {
  const { crystalPackages, purchaseState, purchaseProduct, isInitialized } = useIAP();
  const { balance, addCrystals } = useCrystalBalance();

  const handlePurchase = async (packageId: string) => {
    try {
      const crystalPackage = crystalPackages.find(pkg => pkg.id === packageId);
      if (!crystalPackage) {
        Alert.alert('Error', 'Package not found');
        return;
      }

      Alert.alert(
        'Confirm Purchase',
        `Buy ${crystalPackage.crystals} crystals for $${crystalPackage.price}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Buy',
            onPress: async () => {
              await purchaseProduct(crystalPackage.productId);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate purchase');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const renderCrystalPackage = (crystalPackage: CrystalPackage) => {
    const totalCrystals = crystalPackage.crystals + (crystalPackage.bonus || 0);
    const hasBonus = crystalPackage.bonus && crystalPackage.bonus > 0;

    return (
      <TouchableOpacity
        key={crystalPackage.id}
        style={[
          styles.packageCard,
          crystalPackage.popular && styles.popularCard,
        ]}
        onPress={() => handlePurchase(crystalPackage.id)}
        disabled={purchaseState.isLoading}
      >
        {crystalPackage.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
        
        <LinearGradient
          colors={crystalPackage.popular ? ['#FFD700', '#FFA500'] : ['#6366F1', '#8B5CF6']}
          style={styles.packageGradient}
        >
          <View style={styles.packageContent}>
            <Text style={styles.crystalAmount}>{totalCrystals}</Text>
            <Text style={styles.crystalLabel}>Crystals</Text>
            
            {hasBonus && (
              <View style={styles.bonusContainer}>
                <Text style={styles.bonusText}>
                  +{crystalPackage.bonus} Bonus!
                </Text>
              </View>
            )}
            
            <Text style={styles.packageTitle}>{crystalPackage.title}</Text>
            <Text style={styles.packageDescription}>
              {crystalPackage.description}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {formatPrice(crystalPackage.price, crystalPackage.currency)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading Crystal Shop...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crystal Shop</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Crystals</Text>
        <Text style={styles.balanceAmount}>
          {balance?.crystals || 0} 💎
        </Text>
      </View>

      <ScrollView style={styles.packagesContainer} showsVerticalScrollIndicator={false}>
        {crystalPackages.map(renderCrystalPackage)}
      </ScrollView>

      {purchaseState.isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingOverlayText}>Processing Purchase...</Text>
        </View>
      )}

      {purchaseState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{purchaseState.error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  packagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  packageCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  popularCard: {
    transform: [{ scale: 1.05 }],
    marginVertical: 8,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageGradient: {
    padding: 20,
  },
  packageContent: {
    alignItems: 'center',
  },
  crystalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  crystalLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  bonusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  bonusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 16,
  },
  priceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: '#FF4444',
    padding: 16,
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
