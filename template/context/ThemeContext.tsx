import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  theme: Theme;
  setColorScheme: (scheme: 'light' | 'dark' | null) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  theme: DefaultTheme,
  setColorScheme: () => {},
});

// Enhanced themes with primary color
const lightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#0A84FF',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<'light' | 'dark' | null>(null);

  const effectiveScheme = colorScheme ?? systemColorScheme ?? 'light';
  const theme = effectiveScheme === 'dark' ? darkTheme : lightTheme;

  const setColorScheme = (scheme: 'light' | 'dark' | null) => {
    setColorSchemeState(scheme);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme: effectiveScheme, theme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
