import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { Section } from '../../components/common/Section';
import { useAuth } from '../../hooks/useAuth';
import { useDriverInstitutions, useInstitutions, useUpsertDriverInstitution } from '../../hooks/useInstitutions';
import { colors, radius, spacing, fontSize, fontWeight } from '../../lib/theme';
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
    if (!user?.id) return;

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
        accessible={true}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected, disabled: upsertDriverInstitution.isPending }}
        accessibilityLabel={`مؤسسة ${institution.name}`}
        accessibilityHint={isSelected ? 'هذه المؤسسة مرتبطة بك بالفعل' : 'اضغط لربط هذه المؤسسة بحسابك'}
      >
        <View style={styles.optionContent}>
          <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
            <Ionicons name="business-outline" size={18} color={isSelected ? colors.primary : colors.textMuted} />
          </View>
          <View style={styles.optionTexts}>
            <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>{institution.name}</Text>
            <Text style={styles.optionSubtitle}>{institution.city ?? 'بدون مدينة محددة'}</Text>
          </View>
          {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="bus-outline" size={36} color={colors.accent} />
        </View>
        <Text style={styles.profileName}>{user?.full_name || 'غير مكتمل'}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="bus-outline" size={14} color={colors.accent} />
          <Text style={styles.roleText}>سائق</Text>
        </View>
      </View>

      <Section title="معلومات الحساب">
        <View style={styles.infoRows}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
              <Text style={styles.infoValue}>{user?.email || 'غير متوفر'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>الهاتف</Text>
              <Text style={styles.infoValue}>{user?.phone || 'غير متوفر'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="business-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>المؤسسات</Text>
              <Text style={styles.infoValue}>{institutionNames.length > 0 ? institutionNames.join('، ') : 'لم تربط مؤسسة بعد'}</Text>
            </View>
          </View>
        </View>

        <AppButton title="تسجيل الخروج" onPress={handleSignOut} variant="danger" accessibilityHint="سيتم الخروج من حسابك الحالي" />
      </Section>

      <Section
        title="المؤسسات التي أخدمها"
        subtitle="اختر الجامعة أو المؤسسة التي تنقل طلابها حتى تظهر للطلاب عند طلب الاشتراك."
      >
        <View style={styles.options}>
          {institutions.isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ padding: 20 }} accessibilityLabel="جاري تحميل المؤسسات" />
          ) : institutions.isError ? (
            <EmptyState title="حدث خطأ" message="تعذر تحميل المؤسسات" icon="alert-circle-outline" />
          ) : (
            institutions.data?.map(renderInstitution)
          )}
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  profileName: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    writingDirection: 'rtl',
  },
  roleBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  roleText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    writingDirection: 'rtl',
  },
  infoRows: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  infoValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    textAlign: 'right',
    writingDirection: 'rtl',
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
