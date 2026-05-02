import { ReactNode } from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle, Platform } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

export interface SectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  icon?: string;
}

export function Section({ title, subtitle, children, style }: SectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
