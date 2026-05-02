import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

interface StatusCardProps {
  title: string;
  subtitle?: string;
  variant: 'success' | 'warning' | 'danger' | 'info' | 'muted';
}

const variantConfig = {
  success: { bg: colors.successLight, color: colors.success },
  warning: { bg: colors.warningLight, color: colors.warning },
  danger: { bg: colors.dangerLight, color: colors.danger },
  info: { bg: colors.infoLight, color: colors.info },
  muted: { bg: colors.surfaceMuted, color: colors.textMuted },
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
