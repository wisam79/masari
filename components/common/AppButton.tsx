import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '../../lib/theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  className?: string;
}

export function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  className = '',
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  const baseStyle = "items-center rounded-lg border min-h-[48px] justify-center px-4";
  const disabledStyle = isDisabled ? "opacity-55" : "";
  
  let variantStyle = "";
  let textStyle = "text-white text-base font-bold text-center";

  switch (variant) {
    case 'primary':
      variantStyle = "bg-primary border-primary";
      break;
    case 'secondary':
      variantStyle = "bg-surface border-primary";
      textStyle = "text-primary text-base font-bold text-center";
      break;
    case 'danger':
      variantStyle = "bg-danger border-danger";
      break;
    case 'ghost':
      variantStyle = "bg-transparent border-transparent";
      textStyle = "text-primary text-base font-bold text-center";
      break;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      className={`${baseStyle} ${variantStyle} ${disabledStyle} ${className} active:opacity-85`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text className={textStyle} style={{ writingDirection: 'rtl' }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}