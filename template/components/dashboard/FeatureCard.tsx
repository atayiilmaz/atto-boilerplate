import React from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Subtitle, Body } from '../ui/Typography';

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
}

export function FeatureCard({ icon, title, description, onPress, testID }: FeatureCardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  // Use primary color from theme or fallback to blue
  const primaryColor = colors.primary || '#007AFF';
  const primaryBackground = primaryColor + '20';

  // Brighter background for dark mode
  const isDark = theme.dark;
  const cardBackground = isDark ? '#2C2C2E' : (colors.card || colors.background);

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: cardBackground,
          opacity: pressed ? 0.8 : 1,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: primaryBackground }]}>
        <MaterialIcons name={icon} size={28} color={primaryColor} />
      </View>
      <View style={styles.textContainer}>
        <Subtitle numberOfLines={1}>{title}</Subtitle>
        <Body color="secondary" style={styles.description}>
          {description}
        </Body>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 4,
  },
  description: {
    fontSize: 14,
  },
});
