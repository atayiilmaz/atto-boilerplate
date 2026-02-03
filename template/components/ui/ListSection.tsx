import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ListSectionProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function ListSection({ title, children, style, testID }: ListSectionProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View testID={testID} style={[styles.section, style]}>
      {title && (
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {title.toUpperCase()}
        </Text>
      )}
      <View style={[styles.sectionContent, { backgroundColor: colors.background }]}>{children}</View>
    </View>
  );
}

interface ListItemProps {
  label: string;
  detail?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export function ListItem({ label, detail, onPress, rightElement, style, testID }: ListItemProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const content = (
    <>
      <View style={styles.itemContent}>
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
        {detail && (
          <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>{detail}</Text>
        )}
      </View>
      {rightElement && <View style={styles.itemRight}>{rightElement}</View>}
    </>
  );

  return (
    <View
      testID={testID}
      style={[styles.item, { borderBottomColor: colors.border }, style]}
    >
      {onPress ? (
        <Pressable
          onPress={onPress}
          style={styles.pressableOverlay}
          android_ripple={{ color: colors.ripple }}
        >
          {content}
        </Pressable>
      ) : (
        content
      )}
    </View>
  );
}

export function ListSectionItem({
  label,
  detail,
  onPress,
  style,
  testID,
}: Omit<ListItemProps, 'rightElement'>) {
  return <ListItem label={label} detail={detail} onPress={onPress} style={style} testID={testID} />;
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '400',
  },
  itemDetail: {
    fontSize: 15,
    marginTop: 2,
  },
  itemRight: {
    marginLeft: 12,
    alignItems: 'center',
  },
  pressableOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});
