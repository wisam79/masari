import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useDriverInstitutions, useInstitutions, useUpsertDriverInstitution } from '../../hooks/useInstitutions';
import { useDriverSubscriptions } from '../../hooks/useSubscriptions';
import { colors } from '../../lib/theme';
import { userRepository } from '../../repositories/UserRepository';
import { useAuthStore } from '../../store/authStore';
import type { Institution } from '../../types/models';

export default function DriverHomeScreen() {
  const { user } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);
  const institutions = useInstitutions();
  const driverInstitutions = useDriverInstitutions(user?.id);
  const subscriptions = useDriverSubscriptions(user?.id);
  const upsertDriverInstitution = useUpsertDriverInstitution();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');

  const pendingCount = subscriptions.data?.filter((subscription) => subscription.status === 'pending').length ?? 0;
  const activeCount = subscriptions.data?.filter((subscription) => subscription.status === 'active').length ?? 0;
  const linkedInstitutionIds = new Set(driverInstitutions.data?.map((item) => item.institution_id) ?? []);

  const saveDriverSetup = async () => {
    if (!user?.id) {
      return;
    }

    if (fullName.trim().length < 2) {
      Alert.alert('الاسم مطلوب', 'أدخل اسمك الكامل كما سيظهر للطلاب');
      return;
    }

    if (!selectedInstitutionId) {
      Alert.alert('اختر المؤسسة', 'اختر جامعة أو مؤسسة تخدمها');
      return;
    }

    try {
      const updatedUser = await userRepository.updateUser(user.id, { full_name: fullName.trim() });
      if (updatedUser) {
        setUser(updatedUser);
      }

      await upsertDriverInstitution.mutateAsync({
        driver_id: user.id,
        institution_id: selectedInstitutionId,
        is_active: true,
      });

      setSelectedInstitutionId('');
      Alert.alert('تم الحفظ', 'أصبح الطلاب في هذه المؤسسة قادرين على طلب الاشتراك منك');
    } catch (error) {
      Alert.alert('تعذر الحفظ', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const renderInstitution = (institution: Institution) => {
    const isLinked = linkedInstitutionIds.has(institution.id);
    const isSelected = selectedInstitutionId === institution.id;

    return (
      <Pressable
        key={institution.id}
        onPress={() => setSelectedInstitutionId(institution.id)}
        style={[styles.option, (isLinked || isSelected) && styles.optionSelected]}
      >
        <Text style={[styles.optionTitle, (isLinked || isSelected) && styles.optionTitleSelected]}>
          {institution.name}
        </Text>
        <Text style={styles.optionSubtitle}>{isLinked ? 'مرتبطة بحسابك' : institution.city ?? 'بدون مدينة محددة'}</Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.greeting}>أهلاً {user?.full_name || 'سائق مساري'}</Text>
        <Text style={styles.caption}>اربط حسابك بالمؤسسات التي تخدمها حتى يستقبل حسابك طلبات الطلاب الصحيحة فقط.</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{pendingCount}</Text>
          <Text style={styles.metricLabel}>طلبات بانتظارك</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{activeCount}</Text>
          <Text style={styles.metricLabel}>اشتراكات فعّالة</Text>
        </View>
      </View>

      <Section title="إعداد حساب السائق" subtitle="يمكنك خدمة أكثر من مؤسسة، وسيظهر اسمك فقط لطلاب المؤسسات المرتبطة بك.">
        <AppTextInput label="الاسم الكامل" value={fullName} onChangeText={setFullName} placeholder="مثال: أبو حسين" />
        <View style={styles.options}>
          {institutions.data && institutions.data.length > 0 ? (
            institutions.data.map(renderInstitution)
          ) : (
            <EmptyState title="لا توجد مؤسسات" message="لم يتم تحميل المؤسسات بعد." />
          )}
        </View>
        <AppButton
          title="حفظ وربط المؤسسة"
          onPress={saveDriverSetup}
          loading={upsertDriverInstitution.isPending}
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  caption: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metrics: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  metric: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  metricValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'right',
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  options: {
    gap: 8,
  },
  option: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  optionSelected: {
    backgroundColor: '#E3F4F2',
    borderColor: colors.primary,
  },
  optionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
