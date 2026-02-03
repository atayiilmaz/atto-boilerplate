import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { OnboardingProvider } from '../context/OnboardingContext';
import { PremiumProvider } from '../context/PremiumContext';
import { AdsProvider } from '../context/AdsContext';
import { initFirebase, signInAnonymously, setUserId } from '../services/firebase';
import '../lib/storage';
import '../lib/i18n';

// Keep the splash screen visible while resources load
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here if needed
  });

  useEffect(() => {
    // Initialize Firebase in background
    initFirebase().then((initialized) => {
      if (initialized) {
        console.log('[App] Firebase initialized');
        // Sign in anonymously for user tracking
        signInAnonymously().then((user) => {
          if (user) {
            setUserId(user.uid);
          }
        });
      }
    });

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <OnboardingProvider>
        <PremiumProvider>
          <AdsProvider>
            <RootLayoutNavigator />
          </AdsProvider>
        </PremiumProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}

function RootLayoutNavigator() {
  const { colorScheme, theme } = useTheme();

  return (
    <NavigationThemeProvider value={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="paywall" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
