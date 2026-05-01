import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useDriverInstitutions, useInstitutions, useUpsertDriverInstitution } from '../../hooks/useInstitutions';
import { colors } from '../../lib/theme';
import type { Institution } from '../../types/models';

export default function DriverProfileScreen() {
  const { user, signOut } = useAuth();
  const institutions = useInstitutions();
  const driverInstitutions = useDriverInstitutions(user?.id);
  const upsertDriverInstitution = useUpsertDriverInstitution();

  const handleSignOut = async () => {
    const success = await signOut();
    if (!success) {
      Alert.alert('تعذر تسجيل الخروج', 'حاول مرة أخرى');
    }
  };

  const institutionNames =
    driverInstitutions.data
      ?.map((link) => institutions.data?.find((institution) => institution.id === link.institution_id)?.name)
      .filter((name): name is string => Boolean(name)) ?? [];

  const selectedInstitutionIds = new Set(driverInstitutions.data?.map((link) => link.institution_id) ?? []);

  const handleSelectInstitution = async (institutionId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      await upsertDriverInstitution.mutateAsync({
        driver_id: user.id,
        institution_id: institutionId,
        is_active: true,
      });
      Alert.alert('تم الربط', 'سيظهر حسابك الآن للطلاب في هذه المؤسسة.');
    } catch (error) {
      Alert.alert('تعذر ربط المؤسسة', error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    }
  };

  const renderInstitution = (institution: Institution) => {
    const isSelected = selectedInstitutionIds.has(institution.id);

    return (
      <Pressable
        key={institution.id}
        onPress={() => handleSelectInstitution(institution.id)}
        disabled={upsertDriverInstitution.isPending}
        style={[styles.option, isSelected && styles.optionSelected]}
      >
        <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{institution.name}</Text>
        <Text style={styles.optionSubtitle}>{institution.city ?? 'بدون مدينة محددة'}</Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <Section title="حساب السائق">
        <View style={styles.infoBox}>
          <Text style={styles.info}>الاسم: {user?.full_name || 'غير مكتمل'}</Text>
          <Text style={styles.info}>الهاتف: {user?.phone || 'غير متوفر'}</Text>
          <Text style={styles.info}>نوع الحساب: سائق</Text>
          <Text style={styles.info}>
            المؤسسات: {institutionNames.length > 0 ? institutionNames.join('، ') : 'لم تربط مؤسسة بعد'}
          </Text>
        </View>
        <AppButton title="تسجيل الخروج" onPress={handleSignOut} variant="danger" />
      </Section>

      <Section
        title="المؤسسات التي أخدمها"
        subtitle="اختر الجامعة أو المؤسسة التي تنقل طلابها حتى تظهر للطلاب عند طلب الاشتراك."
      >
        <View style={styles.options}>{institutions.data?.map(renderInstitution)}</View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    gap: 10,
  },
  info: {
    color: colors.text,
    fontSize: 15,
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
