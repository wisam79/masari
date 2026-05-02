import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { MetricCard } from '../../components/common/ScreenHeader';
import { useAuth } from '../../hooks/useAuth';
import { useDriverInstitutions, useInstitutions, useUpsertDriverInstitution } from '../../hooks/useInstitutions';
import { useDriverSubscriptions } from '../../hooks/useSubscriptions';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
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
    if (!user?.id) return;

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
      if (updatedUser) setUser(updatedUser);

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
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected || isLinked }}
        accessibilityLabel={`مؤسسة ${institution.name}`}
        accessibilityHint={isLinked ? 'هذه المؤسسة مرتبطة بحسابك' : 'اضغط لاختيار هذه المؤسسة'}
      >
        <View style={styles.optionContent}>
          <View style={[styles.optionIcon, (isLinked || isSelected) && styles.optionIconSelected]}>
            <Ionicons name="business-outline" size={18} color={(isLinked || isSelected) ? colors.primary : colors.textMuted} />
          </View>
          <View style={styles.optionTexts}>
            <Text style={[styles.optionTitle, (isLinked || isSelected) && styles.optionTitleSelected]}>
              {institution.name}
            </Text>
            <Text style={styles.optionSubtitle}>{isLinked ? 'مرتبطة بحسابك' : institution.city ?? 'بدون مدينة محددة'}</Text>
          </View>
          {isLinked && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <View style={styles.greetingSection}>
        <View style={styles.avatarCircle}>
          <Ionicons name="bus-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.greetingTexts}>
          <Text style={styles.greeting}>أهلاً {user?.full_name || 'سائق مساري'}</Text>
          <Text style={styles.caption}>اربط حسابك بالمؤسسات التي تخدمها حتى يستقبل حسابك طلبات الطلاب الصحيحة فقط.</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard value={pendingCount} label="طلبات بانتظارك" variant="warning" />
        <MetricCard value={activeCount} label="اشتراكات فعّالة" variant="success" />
      </View>

      <Section title="إعداد حساب السائق" subtitle="يمكنك خدمة أكثر من مؤسسة، وسيظهر اسمك فقط لطلاب المؤسسات المرتبطة بك.">
        <AppTextInput label="الاسم الكامل" value={fullName} onChangeText={setFullName} placeholder="مثال: أبو حسين" />
        <View style={styles.options}>
          {institutions.isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ padding: 20 }} accessibilityLabel="جاري تحميل المؤسسات" />
          ) : institutions.isError ? (
            <EmptyState title="حدث خطأ" message="تعذر تحميل المؤسسات" icon="alert-circle-outline" />
          ) : institutions.data && institutions.data.length > 0 ? (
            institutions.data.map(renderInstitution)
          ) : (
            <EmptyState title="لا توجد مؤسسات" message="لم يتم تحميل المؤسسات بعد." icon="business-outline" />
          )}
        </View>
        <AppButton
          title="حفظ وربط المؤسسة"
          onPress={saveDriverSetup}
          loading={upsertDriverInstitution.isPending}
          disabled={institutions.isLoading || upsertDriverInstitution.isPending}
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  greetingSection: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingTexts: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  caption: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  metricsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconSelected: {
    backgroundColor: colors.primaryLight,
  },
  optionTexts: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  optionTitleSelected: {
    color: colors.primary,
  },
  optionSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
