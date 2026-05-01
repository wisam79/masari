import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { Screen } from '../components/common/Screen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validateEmail } from '../utils/validators';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      Alert.alert('بريد إلكتروني غير صحيح', 'أدخل عنوان بريد إلكتروني صالح');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(normalizedEmail);
      if (result.success) {
        Alert.alert(
          'تم الإرسال',
          'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
          [{ text: 'حسناً', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('فشل الإرسال', result.error || 'تأكد من صحة البريد الإلكتروني');
      }
    } catch (_error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>استعادة كلمة المرور</Text>
        <Text style={styles.subtitle}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة كلمة المرور.</Text>
      </View>

      <View style={styles.form}>
        <AppTextInput
          label="البريد الإلكتروني"
          placeholder="example@student.edu.iq"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />

        <AppButton title="إرسال الرابط" onPress={handleReset} loading={loading} />

        <View style={styles.backContainer}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>العودة لتسجيل الدخول</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});