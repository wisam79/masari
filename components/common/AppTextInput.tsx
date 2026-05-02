import { StyleSheet, Text, TextInput, TextInputProps, View, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';

export interface AppTextInputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  error?: boolean;
}

export function AppTextInput({ 
  label, 
  style, 
  containerStyle, 
  labelStyle, 
  error = false,
  ...props 
}: AppTextInputProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textLight}
        style={[styles.input, error && styles.inputError, style]}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    writingDirection: 'rtl',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
    }),
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
});
