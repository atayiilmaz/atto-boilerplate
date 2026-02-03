import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Purchases from 'react-native-purchases';
import { REVENUECAT } from '../constants/revenuecat';

// Initialize RevenueCat (replace with your actual API keys)
const REVENUECAT_API_KEY = __DEV__
  ? 'test_ExwHJlBQFhvbgXjSWUFdziAEYKI' // Test key
  : 'YOUR_REVENUECAT_API_KEY'; // Replace with your production key

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  isLoading: true,
  checkPremiumStatus: async () => {},
});

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      setIsPremium(
        Object.keys(customerInfo.entitlements.active).includes(
          REVENUECAT.ENTITLEMENT_ID
        )
      );
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    checkPremiumStatus();

    // CustomerInfoUpdateListener receives customerInfo directly
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      setIsPremium(
        Object.keys(customerInfo.entitlements.active).includes(
          REVENUECAT.ENTITLEMENT_ID
        )
      );
    });
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, checkPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}
