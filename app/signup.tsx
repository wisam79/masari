import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { AppTextInput } from '../components/common/AppTextInput';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { validateEmail, validatePassword } from '../utils/validators';
import { translateError } from '../utils/errorMessages';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSignup = async () => {
    setEmailError('');
    setFullNameError('');
    setPasswordError('');
    setConfirmPasswordError('');
    let isValid = true;

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailError('البريد الإلكتروني مطلوب');
      isValid = false;
    } else if (!validateEmail(normalizedEmail)) {
      setEmailError('يرجى إدخال عنوان بريد إلكتروني صالح');
      isValid = false;
    }

    if (!fullName.trim() || fullName.trim().length < 2) {
      setFullNameError('الاسم الكامل مطلوب (حرفان على الأقل)');
      isValid = false;
    }

    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('يرجى تأكيد كلمة المرور');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('كلمات المرور غير متطابقة');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const result = await signUp(normalizedEmail, password, fullName.trim());
      if (result.success) {
        if (result.error === 'Profile creation pending') {
          Alert.alert(
            'تم إنشاء الحساب',
            'تم إنشاء حسابك بنجاح. قد يستغرق إعداد الملف الشخصي لحظات. يرجى تسجيل الدخول.',
            [{ text: 'حسناً', onPress: () => router.replace('/') }]
          );
        } else {
          Alert.alert(
            'تم إنشاء الحساب',
            'يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب (إن تطلب الأمر) أو يمكنك المتابعة الآن.',
            [{ text: 'حسناً', onPress: () => router.replace('/') }]
          );
        }
      } else {
        Alert.alert('فشل إنشاء الحساب', translateError(result.error || ''));
      }
    } catch (_error) {
      Alert.alert('خطأ', 'حدث خطأ غير متوقع أثناء إنشاء الحساب');
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
          <Text style={styles.tagline}>انضم إلينا الآن</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>إنشاء حساب جديد</Text>
        <Text style={styles.cardSubtitle}>
          أدخل بياناتك للانضمام إلى مساري
        </Text>

        <View style={styles.form}>
          <View>
            <AppTextInput
              label="الاسم الكامل"
              placeholder="مثال: علي أحمد"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setFullNameError('');
              }}
              accessibilityLabel="حقل إدخال الاسم الكامل"
            />
            {!!fullNameError && (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {fullNameError}
              </Text>
            )}
          </View>

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
              accessibilityLabel="حقل إدخال البريد الإلكتروني"
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
            />
            {!!passwordError && (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {passwordError}
              </Text>
            )}
          </View>

          <View>
            <AppTextInput
              label="تأكيد كلمة المرور"
              placeholder="********"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
              }}
              secureTextEntry
              accessibilityLabel="حقل تأكيد كلمة المرور"
            />
            {!!confirmPasswordError && (
              <Text style={styles.errorText} accessibilityLiveRegion="polite">
                {confirmPasswordError}
              </Text>
            )}
          </View>

          <AppButton
            title="إنشاء الحساب"
            onPress={handleSignup}
            loading={loading}
            accessibilityLabel="زر إنشاء الحساب"
            accessibilityState={{ disabled: loading }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>لديك حساب بالفعل؟ </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="العودة لتسجيل الدخول"
        >
          <Text style={styles.footerLink}>تسجيل الدخول</Text>
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
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 40,
    paddingTop: 48,
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
    gap: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    writingDirection: 'rtl',
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
