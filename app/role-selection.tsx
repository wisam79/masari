import { useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/common/Screen';
import { useAuth } from '../hooks/useAuth';
import { colors, radius, spacing, fontSize, fontWeight } from '../lib/theme';
import { userRepository } from '../repositories/UserRepository';
import { useAuthStore } from '../store/authStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const [loadingRole, setLoadingRole] = useState<'student' | 'driver' | null>(null);

  const handleSelectRole = async (role: 'student' | 'driver') => {
    if (!user?.id) {
      Alert.alert('تعذر المتابعة', 'لم يتم العثور على حساب المستخدم الحالي، يرجى تسجيل الدخول مجدداً');
      return;
    }

    setLoadingRole(role);
    try {
      const updatedUser = await userRepository.updateUserRole(user.id, role);
      if (!updatedUser) {
        Alert.alert('تعذر الحفظ', 'لم نتمكن من تحديث نوع الحساب، يرجى المحاولة لاحقاً');
        return;
      }
      setUser(updatedUser);
      router.replace(role === 'student' ? '/(student_tabs)' : '/(driver_tabs)');
    } catch (_error) {
      Alert.alert('تعذر الحفظ', 'حدث خطأ غير متوقع أثناء تحديث نوع الحساب. تحقق من اتصالك بالإنترنت');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.headerCurve}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🚌</Text>
        </View>
        <Text style={styles.appName}>مساري</Text>
        <Text style={styles.tagline}>اختر طريقة استخدامك للتطبيق</Text>
      </View>

      <Pressable
        onPress={() => handleSelectRole('student')}
        disabled={loadingRole !== null}
        style={({ pressed }) => [
          styles.roleCard,
          pressed && styles.roleCardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="الدخول كطالب"
        accessibilityHint="يحدد دورك كطالب وينقلك إلى الشاشة الرئيسية للطلاب"
        accessibilityState={{ disabled: loadingRole !== null, busy: loadingRole === 'student' }}
      >
        <View style={styles.roleIconCircle}>
          <Ionicons name="school-outline" size={36} color={colors.primary} />
        </View>
        <Text style={styles.roleTitle}>طالب</Text>
        <Text style={styles.roleDescription}>اربط اشتراكك بسائق يخدم جامعتك، وارفع وصل الدفع، وحدد غيابك اليومي عند الحاجة.</Text>
        <View style={styles.roleButton}>
          {loadingRole === 'student' ? (
            <Text style={styles.roleButtonText}>جاري التحميل...</Text>
          ) : (
            <Text style={styles.roleButtonText}>الدخول كطالب</Text>
          )}
        </View>
      </Pressable>

      <Pressable
        onPress={() => handleSelectRole('driver')}
        disabled={loadingRole !== null}
        style={({ pressed }) => [
          styles.roleCard,
          pressed && styles.roleCardPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="الدخول كسائق"
        accessibilityHint="يحدد دورك كسائق وينقلك إلى الشاشة الرئيسية للسائقين"
        accessibilityState={{ disabled: loadingRole !== null, busy: loadingRole === 'driver' }}
      >
        <View style={[styles.roleIconCircle, { backgroundColor: colors.accentLight }]}>
          <Ionicons name="bus-outline" size={36} color={colors.accent} />
        </View>
        <Text style={styles.roleTitle}>سائق</Text>
        <Text style={styles.roleDescription}>اختر المؤسسات التي تخدمها، راجع طلبات الاشتراك، وأدر حضور الطلاب ومسار اليوم.</Text>
        <View style={[styles.roleButton, { backgroundColor: colors.accent }]}>
          {loadingRole === 'driver' ? (
            <Text style={styles.roleButtonText}>جاري التحميل...</Text>
          ) : (
            <Text style={styles.roleButtonText}>الدخول كسائق</Text>
          )}
        </View>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headerCurve: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    paddingBottom: 36,
    paddingTop: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginHorizontal: -spacing.lg,
    marginTop: -spacing.lg,
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    writingDirection: 'rtl',
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    writingDirection: 'rtl',
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  roleCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  roleIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  roleDescription: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 22,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  roleButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    width: '100%',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
  },
});
