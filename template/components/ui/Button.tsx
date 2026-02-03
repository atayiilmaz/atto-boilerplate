import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getBackgroundColor = (): string => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.background;
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.text + '99';
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
        return colors.primary;
      case 'ghost':
        return colors.text;
    }
  };

  const getBorderColor = (): string => {
    if (variant === 'secondary' && !disabled) return colors.primary;
    return 'transparent';
  };

  const getHeight = (): number => {
    switch (size) {
      case 'small': return 36;
      case 'medium': return 48;
      case 'large': return 56;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'small': return 14;
      case 'medium': return 17;
      case 'large': return 19;
    }
  };

  const getPadding = (): { paddingHorizontal: number } => {
    switch (size) {
      case 'small': return { paddingHorizontal: 16 };
      case 'medium': return { paddingHorizontal: 24 };
      case 'large': return { paddingHorizontal: 32 };
    }
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          height: getHeight(),
        },
        getPadding(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getFontSize() },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '600',
  },
});
