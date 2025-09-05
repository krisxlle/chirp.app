// monetization/components/Paywall.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useCrystalBalance } from '../hooks/useCrystalBalance';
import type { PaywallConfig } from '../types/iap';
import { CrystalShop } from './CrystalShop';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  triggerEvent?: string;
  config?: PaywallConfig;
}

const { width, height } = Dimensions.get('window');

export const Paywall: React.FC<PaywallProps> = ({
  visible,
  onClose,
  triggerEvent,
  config,
}) => {
  const { balance } = useCrystalBalance();
  const [showCrystalShop, setShowCrystalShop] = useState(false);

  const defaultConfig: PaywallConfig = {
    enabled: true,
    triggerEvents: ['insufficient_crystals', 'premium_feature'],
    showAfterActions: ['post_chirp', 'view_profile'],
    cooldownMinutes: 30,
    maxShowsPerDay: 3,
    ...config,
  };

  const handleGetCrystals = () => {
    setShowCrystalShop(true);
  };

  const handleCloseCrystalShop = () => {
    setShowCrystalShop(false);
  };

  const handleClosePaywall = () => {
    setShowCrystalShop(false);
    onClose();
  };

  const getPaywallContent = () => {
    switch (triggerEvent) {
      case 'insufficient_crystals':
        return {
          title: 'Need More Crystals?',
          subtitle: 'You need more crystals to continue',
          description: 'Get crystals to unlock premium features and continue your Chirp journey!',
          buttonText: 'Get Crystals',
        };
      case 'premium_feature':
        return {
          title: 'Premium Feature',
          subtitle: 'Unlock this feature with crystals',
          description: 'This feature requires crystals. Get some now to access premium content!',
          buttonText: 'Get Crystals',
        };
      default:
        return {
          title: 'Get More Crystals',
          subtitle: 'Enhance your Chirp experience',
          description: 'Crystals unlock premium features and help you get the most out of Chirp!',
          buttonText: 'Get Crystals',
        };
    }
  };

  const content = getPaywallContent();

  if (!defaultConfig.enabled) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClosePaywall}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {showCrystalShop ? (
            <CrystalShop onClose={handleCloseCrystalShop} />
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>{content.title}</Text>
                <Text style={styles.subtitle}>{content.subtitle}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.crystalIcon}>
                  <Text style={styles.crystalEmoji}>💎</Text>
                </View>

                <Text style={styles.description}>{content.description}</Text>

                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>Your Crystals</Text>
                  <Text style={styles.balanceAmount}>
                    {balance?.crystals || 0} 💎
                  </Text>
                </View>

                <View style={styles.featuresContainer}>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>✨</Text>
                    <Text style={styles.featureText}>Premium Features</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🎨</Text>
                    <Text style={styles.featureText}>Custom Themes</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🚀</Text>
                    <Text style={styles.featureText}>Priority Support</Text>
                  </View>
                </View>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.getCrystalsButton}
                  onPress={handleGetCrystals}
                >
                  <LinearGradient
                    colors={['#6366F1', '#8B5CF6']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>{content.buttonText}</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClosePaywall}
                >
                  <Text style={styles.closeButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  crystalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  crystalEmoji: {
    fontSize: 40,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  balanceContainer: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  getCrystalsButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#AAAAAA',
  },
});
