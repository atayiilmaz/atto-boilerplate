import { createContext, useContext, ReactNode } from 'react';
import { usePremium } from './PremiumContext';

interface AdsContextType {
  shouldShowAds: boolean;
}

const AdsContext = createContext<AdsContextType>({
  shouldShowAds: true,
});

export function AdsProvider({ children }: { children: ReactNode }) {
  const { isPremium } = usePremium();

  return (
    <AdsContext.Provider value={{ shouldShowAds: !isPremium }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within AdsProvider');
  }
  return context;
}
