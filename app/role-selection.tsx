import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '../components/common/AppButton';
import { Screen } from '../components/common/Screen';
import { Section } from '../components/common/Section';
import { useAuth } from '../hooks/useAuth';
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
      <View className="gap-2 pt-6">
        <Text className="text-primary text-[42px] font-black text-right" style={{ writingDirection: 'rtl' }}>
          مساري
        </Text>
        <Text className="text-text text-[22px] font-extrabold text-right" style={{ writingDirection: 'rtl' }}>
          اختر طريقة استخدامك للتطبيق
        </Text>
      </View>

      <View className="mt-8 gap-6">
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
      </View>
    </Screen>
  );
}