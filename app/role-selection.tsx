import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../lib/theme';
import { userRepository } from '../repositories/UserRepository';
import { useAuthStore } from '../store/authStore';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const [loadingRole, setLoadingRole] = useState<'student' | 'driver' | null>(null);

  const handleSelectRole = async (role: 'student' | 'driver') => {
    if (!user?.id) {
      Alert.alert('تعذر المتابعة', 'لم يتم العثور على حساب المستخدم الحالي');
      return;
    }

    setLoadingRole(role);
    try {
      const updatedUser = await userRepository.updateUserRole(user.id, role);

      if (!updatedUser) {
        Alert.alert('تعذر الحفظ', 'لم نتمكن من تحديث نوع الحساب');
        return;
      }

      setUser(updatedUser);
      router.replace(role === 'student' ? '/(student_tabs)' : '/(driver_tabs)');
    } catch (_error) {
      Alert.alert('تعذر الحفظ', 'حدث خطأ غير متوقع أثناء تحديث نوع الحساب');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.appName}>مساري</Text>
        <Text style={styles.title}>اختر طريقة استخدامك للتطبيق</Text>
      </View>

      <Section
        title="طالب"
        subtitle="اربط اشتراكك بسائق يخدم جامعتك، وارفع وصل الدفع، وحدد غيابك اليومي عند الحاجة."
      >
        <AppButton
          title="الدخول كطالب"
          onPress={() => handleSelectRole('student')}
          loading={loadingRole === 'student'}
          disabled={loadingRole !== null}
        />
      </Section>

      <Section
        title="سائق"
        subtitle="اختر المؤسسات التي تخدمها، راجع طلبات الاشتراك، وأدر حضور الطلاب ومسار اليوم."
      >
        <AppButton
          title="الدخول كسائق"
          onPress={() => handleSelectRole('driver')}
          loading={loadingRole === 'driver'}
          disabled={loadingRole !== null}
          variant="secondary"
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 8,
    paddingTop: 24,
  },
  appName: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
