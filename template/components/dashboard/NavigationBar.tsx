import React from 'react';
import { View, StyleSheet, Pressable, Image, GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Body } from '../ui/Typography';

interface NavigationBarProps {
  userName?: string;
  onNotificationPress?: (event: GestureResponderEvent) => void;
  testID?: string;
}

const AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

export function NavigationBar({ userName = 'Dev', onNotificationPress, testID }: NavigationBarProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={testID}>
      <View style={styles.leftSection}>
        <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
        <View style={styles.textContainer}>
          <Body style={styles.label} color="secondary">
            {t('tabs.home')}
          </Body>
          <Body style={styles.greeting}>
            {t('dashboard.welcome')}, {userName}
          </Body>
        </View>
      </View>
      <Pressable
        onPress={onNotificationPress}
        style={({ pressed }) => [
          styles.notificationButton,
          { backgroundColor: colors.card || colors.background, opacity: pressed ? 0.7 : 1 },
        ]}
        testID={`${testID}-notifications`}
      >
        <MaterialIcons name="notifications" size={22} color={colors.text} />
        <View style={styles.notificationBadge} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textContainer: {
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});
