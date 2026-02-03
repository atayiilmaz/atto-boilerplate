import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Purchases from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePremium } from '../context/PremiumContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { firebaseAnalytics } from '../services/firebase';

type SelectedPackage = 'weekly' | 'yearly';
type Package = any;

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium, checkPremiumStatus } = usePremium();
  const [_, setHasSeenPaywall] = useLocalStorage('hasSeenPaywall', false);

  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadPackages();
    firebaseAnalytics.logEvent('paywall_viewed', {
      is_premium: isPremium,
    });
  }, [isPremium]);

  const loadPackages = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsPurchasing(true);
    firebaseAnalytics.logEvent('subscribe_clicked', {
      package: selectedPackage,
    });

    try {
      const selectedPkg = packages.find((pkg) =>
        selectedPackage === 'weekly'
          ? pkg.identifier.includes('weekly')
          : pkg.identifier.includes('yearly')
      );

      if (!selectedPkg) {
        throw new Error('Package not found');
      }

      const { customerInfo } = await Purchases.purchasePackage(selectedPkg);

      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        firebaseAnalytics.logEvent('purchase_completed', {
          package: selectedPackage,
        });
        await checkPremiumStatus();
        setHasSeenPaywall(true);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error.code !== 'PURCHASE_CANCELLED') {
        firebaseAnalytics.logEvent('purchase_failed', {
          package: selectedPackage,
          error_code: error.code || 'unknown',
        });
        Alert.alert(t('common.error'), error.message || t('common.error'));
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    firebaseAnalytics.logEvent('restore_clicked', {});

    try {
      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        firebaseAnalytics.logEvent('restore_completed', {
          has_active_purchases: true,
        });
        await checkPremiumStatus();
        setHasSeenPaywall(true);
        router.replace('/(tabs)');
      } else {
        firebaseAnalytics.logEvent('restore_completed', {
          has_active_purchases: false,
        });
        Alert.alert('No purchases found', 'Please subscribe to access premium features.');
      }
    } catch (error: any) {
      firebaseAnalytics.logEvent('restore_failed', {
        error: error.message || 'unknown',
      });
      Alert.alert(t('common.error'), error.message || t('common.error'));
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSkip = () => {
    firebaseAnalytics.logEvent('paywall_dismissed', {
      method: 'skip_button',
    });
    setHasSeenPaywall(true);
    router.replace('/(tabs)');
  };

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <Text style={styles.title}>You are Premium!</Text>
          <Pressable style={styles.button} onPress={handleSkip}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const weeklyPrice = packages.find((p) => p.identifier.includes('weekly'))?.product.priceString;
  const yearlyPrice = packages.find((p) => p.identifier.includes('yearly'))?.product.priceString;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Pressable style={styles.closeButton} onPress={handleSkip} hitSlop={20}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.description}>{t('paywall.description')}</Text>
        </View>

        <View style={styles.benefits}>
          <BenefitItem text={t('paywall.benefits.noAds')} />
          <BenefitItem text={t('paywall.benefits.unlockAll')} />
          <BenefitItem text={t('paywall.benefits.support')} />
        </View>

        <View style={styles.packages}>
          <PackageOption
            title={t('paywall.weekly')}
            price={weeklyPrice || '$4.99'}
            period="/week"
            selected={selectedPackage === 'weekly'}
            onPress={() => {
              setSelectedPackage('weekly');
              firebaseAnalytics.logEvent('package_selected', {
                package: 'weekly',
                price: weeklyPrice || '$4.99',
              });
            }}
          />
          <PackageOption
            title={t('paywall.yearly')}
            price={yearlyPrice || '$129.99'}
            period="/year"
            badge="50% OFF"
            selected={selectedPackage === 'yearly'}
            onPress={() => {
              setSelectedPackage('yearly');
              firebaseAnalytics.logEvent('package_selected', {
                package: 'yearly',
                price: yearlyPrice || '$129.99',
              });
            }}
          />
        </View>

        <Pressable
          style={[styles.button, isPurchasing && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('paywall.subscribe')}</Text>
          )}
        </Pressable>

        <Pressable style={styles.restoreButton} onPress={handleRestore} disabled={isPurchasing}>
          <Text style={styles.restoreText}>{t('paywall.restore')}</Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitCheck}>✓</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function PackageOption({
  title,
  price,
  period,
  badge,
  selected,
  onPress,
}: {
  title: string;
  price: string;
  period: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.packageOption, selected && styles.packageSelected, badge && styles.packageRecommended]}
      onPress={onPress}
    >
      <View style={styles.packageLeft}>
        <View style={styles.packageHeader}>
          <Text style={[styles.packageTitle, selected && styles.packageTitleSelected]}>
            {title}
          </Text>
          {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
        </View>
        <Text style={[styles.packagePrice, selected && styles.packagePriceSelected]}>
          {price}
          <Text style={[styles.packagePeriod, selected && styles.packagePeriodSelected]}>
            {period}
          </Text>
        </Text>
      </View>
      <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
        {selected && <View style={styles.radioButtonInner} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#8e8e93',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#636366',
    textAlign: 'center',
  },
  benefits: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitCheck: {
    fontSize: 20,
    color: '#34C759',
    marginRight: 12,
    fontWeight: '600',
  },
  benefitText: {
    fontSize: 16,
  },
  packages: {
    gap: 12,
    marginBottom: 24,
  },
  packageOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageSelected: {
    borderColor: '#007AFF',
  },
  packageRecommended: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  packageLeft: {
    flex: 1,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  packageTitleSelected: {
    color: '#007AFF',
  },
  badge: {
    backgroundColor: '#FF9500',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  packagePriceSelected: {
    color: '#007AFF',
  },
  packagePeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8e8e93',
  },
  packagePeriodSelected: {
    color: '#007AFF',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#c6c6c8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  restoreButton: {
    padding: 12,
    alignItems: 'center',
  },
  restoreText: {
    color: '#007AFF',
    fontSize: 15,
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipText: {
    color: '#8e8e93',
    fontSize: 15,
  },
});
