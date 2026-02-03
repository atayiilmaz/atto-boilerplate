import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ToggleRowProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
  style,
  testID,
}: ToggleRowProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View testID={testID} style={[styles.container, style]}>
      <Pressable
        style={styles.pressableArea}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </Pressable>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        ios_backgroundColor={disabled ? colors.border : undefined}
        thumbColor={disabled ? colors.textSecondary : colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    backgroundColor: 'transparent',
  },
  pressableArea: {
    flex: 1,
    paddingVertical: 4,
    marginRight: 12,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
  },
});
