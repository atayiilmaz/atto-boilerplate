import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'bordered';
  testID?: string;
}

export function Card({
  children,
  style,
  padding = 16,
  variant = 'default',
  testID,
}: CardProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'elevated':
        return colors.card || '#fff';
      case 'bordered':
        return colors.background;
      default:
        return colors.card || '#fff';
    }
  };

  const getBorder = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4,
          borderRadius: 12,
        } as any;
      case 'bordered':
        return {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: 12,
        };
      default:
        return {
          borderRadius: 12,
        };
    }
  };

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        { backgroundColor: getBackgroundColor(), padding },
        getBorder(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
