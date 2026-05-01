import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { Screen } from '../components/common/Screen';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validateEmail } from '../utils/validators';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      Alert.alert('بريد إلكتروني غير صحيح', 'أدخل عنوان بريد إلكتروني صالح');
      return;
    }

    if (password.length < 6) {
      Alert.alert('كلمة المرور قصيرة', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('كلمات المرور غير متطابقة', 'يرجى التأكد من تطابق كلمتي المرور');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(normalizedEmail, password);
      if (result.success) {
        Alert.alert(
          'تم إنشاء الحساب',
          'يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب (إن تطلب الأمر) أو يمكنك المتابعة الآن.',
          [{ text: 'حسناً' }]
        );
      } else {
        Alert.alert('فشل إنشاء الحساب', result.error || 'حاول مرة أخرى لاحقاً');
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
        <Text style={styles.title}>إنشاء حساب جديد</Text>
        <Text style={styles.subtitle}>أدخل بياناتك للانضمام إلى مساري.</Text>
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
        <AppTextInput
          label="كلمة المرور"
          placeholder="********"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppTextInput
          label="تأكيد كلمة المرور"
          placeholder="********"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <AppButton title="إنشاء الحساب" onPress={handleSignup} loading={loading} />

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.loginLink}>تسجيل الدخول</Text>
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
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  form: {
    gap: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  loginLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});