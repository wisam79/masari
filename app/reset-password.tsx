import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { useAuth } from '../hooks/useAuth';
import { colors, radius, spacing, fontSize, fontWeight } from '../lib/theme';
import { validateEmail } from '../utils/validators';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleReset = async () => {
    setEmailError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('البريد الإلكتروني مطلوب');
      return;
    } else if (!validateEmail(normalizedEmail)) {
      setEmailError('يرجى إدخال عنوان بريد إلكتروني صالح');
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
      Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء محاولة استعادة كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <View style={styles.headerCurve}>
        <View style={styles.logoCircle}>
          <Ionicons name="lock-closed-outline" size={32} color="#FFFFFF" />
        </View>
        <Text style={styles.appName}>استعادة كلمة المرور</Text>
        <Text style={styles.tagline}>أدخل بريدك الإلكتروني وسنرسل لك رابطاً للاستعادة</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.form}>
          <View>
            <AppTextInput
              label="البريد الإلكتروني"
              placeholder="example@student.edu.iq"
              value={email}
              onChangeText={(text) => { setEmail(text); setEmailError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              error={!!emailError}
              accessibilityLabel="حقل إدخال البريد الإلكتروني"
            />
            {!!emailError && <Text style={styles.errorText} accessibilityLiveRegion="polite">{emailError}</Text>}
          </View>

          <AppButton
            title="إرسال رابط الاستعادة"
            onPress={handleReset}
            loading={loading}
            accessibilityLabel="زر إرسال رابط استعادة كلمة المرور"
            accessibilityState={{ disabled: loading }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="العودة لتسجيل الدخول"
        >
          <Text style={styles.footerLink}>العودة لتسجيل الدخول</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCurve: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    paddingBottom: 40,
    paddingTop: 56,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    writingDirection: 'rtl',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    marginHorizontal: spacing.xl,
    marginTop: -20,
    padding: spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  form: {
    gap: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
