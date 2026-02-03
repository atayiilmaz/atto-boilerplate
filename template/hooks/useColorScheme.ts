import { useTheme as useThemeContext } from '../context/ThemeContext';

export function useColorScheme(): 'light' | 'dark' | 'unspecified' {
  const { colorScheme } = useThemeContext();
  return colorScheme;
}
