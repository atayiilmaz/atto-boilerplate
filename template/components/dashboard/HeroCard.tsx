import React from 'react';
import { View, StyleSheet, Pressable, Text, GestureResponderEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Subtitle, Body } from '../ui/Typography';

interface HeroCardProps {
  onViewDocs?: (event: GestureResponderEvent) => void;
  onShare?: (event: GestureResponderEvent) => void;
  testID?: string;
}

export function HeroCard({ onViewDocs, onShare, testID }: HeroCardProps) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#137fec', '#0a4f94']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
      testID={testID}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name="rocket" size={32} color="#fff" />
      </View>

      <View style={styles.textContainer}>
        <Subtitle style={styles.title}>
          {t('dashboard.readyToBuild')}
        </Subtitle>
        <Body style={styles.description} numberOfLines={2}>
          {t('dashboard.readyToBuildDesc')}
        </Body>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={onViewDocs}
          style={[styles.button, styles.primaryButton]}
          testID={`${testID}-view-docs`}
        >
          <Text style={styles.primaryButtonText}>{t('dashboard.viewDocs')}</Text>
        </Pressable>
        <Pressable
          onPress={onShare}
          style={[styles.button, styles.secondaryButton]}
          testID={`${testID}-share`}
        >
          <MaterialIcons name="share" size={18} color="#fff" />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    gap: 6,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  button: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#fff',
  },
  primaryButtonText: {
    color: '#137fec',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    width: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
