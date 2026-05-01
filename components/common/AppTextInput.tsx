import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../lib/theme';

interface AppTextInputProps extends TextInputProps {
  label: string;
}

export function AppTextInput({ label, style, ...props }: AppTextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, style]}
        textAlign="right"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    writingDirection: 'rtl',
  },
});
