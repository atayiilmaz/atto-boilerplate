import React from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Body } from '../ui/Typography';

interface SettingsListItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
}

export function SettingsListItem({ icon, title, subtitle, value, onPress, testID }: SettingsListItemProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const primaryColor = colors.primary || '#137fec';
  const isDark = theme.dark;

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.item,
        pressed && styles.pressed,
        isDark && styles.itemDark,
      ]}
    >
      <View style={styles.leftContainer}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
          <MaterialIcons name={icon} size={24} color={primaryColor} />
        </View>
        <View style={styles.textContainer}>
          <Body style={styles.title}>{title}</Body>
          {subtitle && <Body color="secondary" style={styles.subtitle}>{subtitle}</Body>}
        </View>
      </View>
      <View style={styles.rightContainer}>
        {value && <Body color="secondary" style={styles.value}>{value}</Body>}
        <MaterialIcons name="chevron-right" size={24} color="#617589" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0.2,
  },
  pressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 14,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 14,
  },
});
