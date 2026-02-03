import React from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Subtitle, Body } from '../ui/Typography';

interface StatusBarCardProps {
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
}

export function StatusBarCard({ onPress, testID }: StatusBarCardProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = theme.colors;

  // Brighter background for dark mode
  const isDark = theme.dark;
  const cardBackground = isDark ? '#2C2C2E' : (colors.card || colors.background);

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.container,
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
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#34C75920' }]}>
          <MaterialIcons name="check-circle" size={24} color="#34C759" />
        </View>
        <View style={styles.textContainer}>
          <Subtitle numberOfLines={1}>{t('dashboard.systemStatus')}</Subtitle>
          <Body color="secondary" style={styles.statusText}>
            {t('dashboard.systemOperational')}
          </Body>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={20} color="#8e8e93" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 2,
  },
  statusText: {
    fontSize: 14,
  },
});
