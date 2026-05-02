import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validateEmail, validatePassword } from '../utils/validators';
import { translateError } from '../utils/errorMessages';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    let isValid = true;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('البريد الإلكتروني مطلوب');
      isValid = false;
    } else if (!validateEmail(normalizedEmail)) {
      setEmailError('يرجى إدخال عنوان بريد إلكتروني صالح');
      isValid = false;
    }

    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const result = await signIn(normalizedEmail, password);
      if (!result.success) {
        Alert.alert('فشل تسجيل الدخول', translateError(result.error || ''));
      }
    } catch (_error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
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
        <View style={styles.headerContent}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🚌</Text>
          </View>
          <Text style={styles.appName}>مساري</Text>
          <Text style={styles.tagline}>رحلتك تبدأ هنا</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>تسجيل الدخول</Text>
        <Text style={styles.cardSubtitle}>
          سجل دخولك للمتابعة إلى حسابك
        </Text>

        <View style={styles.form}>
          <View>
            <AppTextInput
              label="البريد الإلكتروني"
              placeholder="example@student.edu.iq"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
              accessibilityLabel="حقل إدخال البريد الإلكتروني"
              accessibilityHint="أدخل بريدك الإلكتروني الجامعي أو الشخصي هنا"
            />
            {!!emailError && (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {emailError}
              </Text>
            )}
          </View>

          <View>
            <AppTextInput
              label="كلمة المرور"
              placeholder="********"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              secureTextEntry
              accessibilityLabel="حقل إدخال كلمة المرور"
              accessibilityHint="أدخل كلمة المرور الخاصة بحسابك"
            />
            {!!passwordError && (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {passwordError}
              </Text>
            )}
          </View>

          <View style={styles.forgotRow}>
            <Link href="/reset-password" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="نسيت كلمة المرور؟"
                accessibilityHint="ينقلك إلى شاشة استعادة كلمة المرور"
              >
                <Text style={styles.forgotPasswordText}>
                  نسيت كلمة المرور؟
                </Text>
              </Pressable>
            </Link>
          </View>

          <AppButton
            title="تسجيل الدخول"
            onPress={handleLogin}
            loading={loading}
            accessibilityLabel="زر تسجيل الدخول"
            accessibilityHint="يقوم بتسجيل دخولك إلى التطبيق"
            accessibilityState={{ disabled: loading }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ليس لديك حساب؟ </Text>
        <Link href="/signup" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="إنشاء حساب جديد"
            accessibilityHint="ينقلك إلى شاشة تسجيل حساب جديد"
          >
            <Text style={styles.footerLink}>إنشاء حساب جديد</Text>
          </Pressable>
        </Link>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40,
    paddingTop: 60,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    writingDirection: 'rtl',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  forgotRow: {
    alignItems: 'flex-start',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
