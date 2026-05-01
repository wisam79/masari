import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { Screen } from '../components/common/Screen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validateOTP } from '../utils/validators';

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { sendOTP, verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOTP = async () => {
    if (!phone) {
      Alert.alert('رقم الهاتف مفقود', 'ارجع وأدخل رقم الهاتف مرة أخرى');
      return;
    }

    if (!validateOTP(otp.trim())) {
      Alert.alert('رمز غير صحيح', 'أدخل رمز التحقق المرسل إلى هاتفك');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(phone, otp.trim());
      if (!result.success) {
        Alert.alert('تعذر الدخول', result.error || 'رمز التحقق غير صحيح');
        return;
      }

      if (result.user?.role === 'student') {
        router.replace('/(student_tabs)');
      } else if (result.user?.role === 'driver') {
        router.replace('/(driver_tabs)');
      } else {
        router.replace('/role-selection');
      }
    } catch (_error) {
      Alert.alert('تعذر الدخول', 'حدث خطأ غير متوقع أثناء التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phone) {
      return;
    }

    setResending(true);
    try {
      const result = await sendOTP(phone);
      Alert.alert(result.success ? 'تم الإرسال' : 'تعذر الإرسال', result.success ? 'أرسلنا رمزاً جديداً' : result.error);
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>تأكيد رقم الهاتف</Text>
        <Text style={styles.subtitle}>أدخل الرمز المرسل إلى {phone}</Text>
      </View>

      <View style={styles.form}>
        <AppTextInput
          label="رمز التحقق"
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
        />
        <AppButton title="تأكيد الدخول" onPress={handleVerifyOTP} loading={loading} />
        <AppButton title="إعادة إرسال الرمز" onPress={handleResendOTP} loading={resending} variant="ghost" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 64,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  form: {
    gap: 16,
  },
});
