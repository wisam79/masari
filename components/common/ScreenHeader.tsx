import { StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  gradient?: boolean;
}

export function ScreenHeader({ title, subtitle, icon, gradient = false }: ScreenHeaderProps) {
  return (
    <View style={[styles.header, gradient && styles.headerGradient]}>
      {icon && (
        <View style={[styles.iconCircle, gradient && styles.iconCircleGradient]}>
          <Ionicons name={icon} size={24} color={gradient ? '#FFFFFF' : colors.primary} />
        </View>
      )}
      <Text style={[styles.title, gradient && styles.titleLight]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, gradient && styles.subtitleLight]}>{subtitle}</Text> : null}
    </View>
  );
}

interface StatusCardProps {
  title: string;
  subtitle?: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'muted';
  icon?: keyof typeof Ionicons.glyphMap;
}

const variantConfig = {
  success: { bg: colors.successLight, color: colors.success, icon: 'checkmark-circle' as const },
  warning: { bg: colors.warningLight, color: colors.warning, icon: 'time-outline' as const },
  danger: { bg: colors.dangerLight, color: colors.danger, icon: 'close-circle' as const },
  info: { bg: colors.infoLight, color: colors.info, icon: 'information-circle' as const },
  muted: { bg: colors.surfaceMuted, color: colors.textMuted, icon: 'ellipse-outline' as const },
};

export function StatusCard({ title, subtitle, variant }: StatusCardProps) {
  const config = variantConfig[variant];
  return (
    <View style={[styles.statusCard, { backgroundColor: config.bg }]}>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        <Text style={[styles.statusTitle, { color: config.color }]}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.statusSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

interface MetricCardProps {
  value: string | number;
  label: string;
  variant?: 'primary' | 'warning' | 'success';
}

const metricVariantConfig = {
  primary: { bg: colors.primaryLight, color: colors.primary },
  warning: { bg: colors.warningLight, color: colors.warning },
  success: { bg: colors.successLight, color: colors.success },
};

export function MetricCard({ value, label, variant = 'primary' }: MetricCardProps) {
  const config = metricVariantConfig[variant];
  return (
    <View style={[styles.metricCard, { backgroundColor: config.bg }]}>
      <Text style={[styles.metricValue, { color: config.color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  headerGradient: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconCircleGradient: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  titleLight: {
    color: '#FFFFFF',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitleLight: {
    color: 'rgba(255,255,255,0.8)',
  },
  statusCard: {
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  statusSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
    paddingRight: 20,
  },
  metricCard: {
    borderRadius: radius.lg,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.black,
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
