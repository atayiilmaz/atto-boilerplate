import React from 'react';
import { Modal, View, StyleSheet, Pressable, Text, ScrollView, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Body, Title } from '../ui/Typography';
import { MaterialIcons } from '@expo/vector-icons';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
];

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLanguage: (code: string) => void;
  currentLanguage: string;
}

export function LanguageModal({ visible, onClose, onSelectLanguage, currentLanguage }: LanguageModalProps) {
  const { t } = useTranslation();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const handleSelectLanguage = (code: string) => {
    onSelectLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={[styles.content, { backgroundColor: isDark ? '#1c1c1e' : '#fff' }]}>
          <View style={styles.header}>
            <Title>{t('settings.language')}</Title>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={isDark ? '#fff' : '#000'} />
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                style={({ pressed }) => [
                  styles.languageItem,
                  pressed && styles.languageItemPressed,
                  currentLanguage === lang.code && styles.languageItemSelected,
                ]}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <View style={styles.languageInfo}>
                  <Body style={styles.languageName}>{lang.nativeName}</Body>
                  <Body style={styles.englishName}>({lang.name})</Body>
                </View>
                {currentLanguage === lang.code && (
                  <MaterialIcons name="check" size={24} color="#137fec" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  languageItemPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  languageItemSelected: {
    backgroundColor: 'rgba(19, 127, 236, 0.1)',
  },
  languageInfo: {
    gap: 4,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
  },
  englishName: {
    fontSize: 14,
    opacity: 0.6,
  },
});
