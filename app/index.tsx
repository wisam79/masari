import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { Screen } from '../components/common/Screen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validatePhoneNumber } from '../utils/validators';

export default function PhoneScreen() {
  const router = useRouter();
  const { sendOTP } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const normalizedPhone = phone.trim();

    if (!validatePhoneNumber(normalizedPhone)) {
      Alert.alert('رقم غير صحيح', 'أدخل رقم هاتف صالحاً مع رمز البلد عند الحاجة');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOTP(normalizedPhone);
      if (result.success) {
        router.push({ pathname: '/otp', params: { phone: normalizedPhone } });
      } else {
        Alert.alert('تعذر إرسال الرمز', result.error || 'حاول مرة أخرى بعد قليل');
      }
    } catch (_error) {
      Alert.alert('تعذر إرسال الرمز', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.appName}>مساري</Text>
        <Text style={styles.subtitle}>نقل شهري منظم بين الطلاب والسائقين حسب المؤسسة والاشتراك.</Text>
      </View>

      <View style={styles.form}>
        <AppTextInput
          label="رقم الهاتف"
          placeholder="+9647xxxxxxxxx"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={16}
          autoFocus
        />
        <AppButton title="إرسال رمز الدخول" onPress={handleSendOTP} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
    paddingTop: 64,
  },
  appName: {
    color: colors.primary,
    fontSize: 52,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  form: {
    gap: 16,
  },
});
