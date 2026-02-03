import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Body } from '../ui/Typography';

interface SettingsToggleRowProps {
  icon: string;
  title: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  testID?: string;
}

export function SettingsToggleRow({ icon, title, value, onValueChange, testID }: SettingsToggleRowProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const primaryColor = colors.primary || '#137fec';
  const isDark = theme.dark;

  return (
    <View style={[styles.item, isDark && styles.itemDark]} testID={testID}>
      <View style={styles.leftContainer}>
        <View style={[styles.iconContainer, { backgroundColor: primaryColor + '20' }]}>
          <MaterialIcons name={icon} size={24} color={primaryColor} />
        </View>
        <Body style={styles.title}>{title}</Body>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: primaryColor }}
        thumbColor="#fff"
        ios_backgroundColor="#d1d5db"
      />
    </View>
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
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
});
