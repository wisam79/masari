import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, TextStyle, StyleProp, Platform } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: { disabled?: boolean; busy?: boolean };
  size?: 'default' | 'small';
}

const variantStyles = {
  primary: {
    container: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    } satisfies ViewStyle,
    text: {
      color: '#FFFFFF',
    } satisfies TextStyle,
  },
  secondary: {
    container: {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    } satisfies ViewStyle,
    text: {
      color: colors.primary,
    } satisfies TextStyle,
  },
  danger: {
    container: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
    } satisfies ViewStyle,
    text: {
      color: '#FFFFFF',
    } satisfies TextStyle,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    } satisfies ViewStyle,
    text: {
      color: colors.primary,
    } satisfies TextStyle,
  },
};

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle: customTextStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  size = 'default',
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const activeVariant = variantStyles[variant];
  const isSmall = size === 'small';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        isSmall && styles.small,
        activeVariant.container,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.primary : '#FFFFFF'} size={isSmall ? 'small' : 'small'} />
      ) : (
        <Text style={[styles.text, { writingDirection: 'rtl' }, activeVariant.text, customTextStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: spacing.xl,
  },
  small: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  text: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
